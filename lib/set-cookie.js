var defaultParseOptions = {
  decodeValues: true,
  map: false,
  silent: false,
  split: "auto", // auto = split strings but not arrays,
  parseDate: defaultDateParser,
};

function isForbiddenKey(key) {
  return typeof key !== "string" || key in {};
}

function createNullObj() {
  return Object.create(null);
}

function isNonEmptyString(str) {
  return typeof str === "string" && !!str.trim();
}

function parseString(setCookieValue, options) {
  var parts = setCookieValue.split(";").filter(isNonEmptyString);

  var nameValuePairStr = parts.shift();
  if (!nameValuePairStr) {
    return null;
  }
  var parsed = parseNameValuePair(nameValuePairStr);
  var name = parsed.name;
  var value = parsed.value;

  options = options
    ? Object.assign({}, defaultParseOptions, options)
    : defaultParseOptions;

  if (isForbiddenKey(name)) {
    return null;
  }

  try {
    value = options.decodeValues ? decodeURIComponent(value) : value; // decode cookie value
  } catch (e) {
    console.error(
      "set-cookie-parser: failed to decode cookie value. Set options.decodeValues=false to disable decoding.",
      e
    );
  }

  var cookie = createNullObj();
  cookie.name = name;
  cookie.value = value;

  parts.forEach(function (part) {
    var sides = part.split("=");
    var key = sides.shift().trim().toLowerCase();
    if (isForbiddenKey(key)) {
      return;
    }
    var value = sides.join("=").trim();
    if (key === "expires") {
      cookie.expires = options.parseDate
        ? options.parseDate(value)
        : new Date(value);
    } else if (key === "max-age") {
      var n = parseInt(value, 10);
      if (!Number.isNaN(n)) cookie.maxAge = n;
    } else if (key === "secure") {
      cookie.secure = true;
    } else if (key === "httponly") {
      cookie.httpOnly = true;
    } else if (key === "samesite") {
      cookie.sameSite = value;
    } else if (key === "partitioned") {
      cookie.partitioned = true;
    } else if (key) {
      cookie[key] = value;
    }
  });

  return cookie;
}

function parseNameValuePair(nameValuePairStr) {
  // Parses name-value-pair according to rfc6265bis draft

  var name = "";
  var value = "";
  var nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("="); // everything after the first =, joined by a "=" if there was more than one part
  } else {
    value = nameValuePairStr;
  }

  return { name: name, value: value };
}

function parseSetCookie(input, options) {
  options = options
    ? Object.assign({}, defaultParseOptions, options)
    : defaultParseOptions;

  if (!input) {
    if (!options.map) {
      return [];
    } else {
      return createNullObj();
    }
  }

  if (input.headers) {
    if (typeof input.headers.getSetCookie === "function") {
      // for fetch responses - they combine headers of the same type in the headers array,
      // but getSetCookie returns an uncombined array
      input = input.headers.getSetCookie();
    } else if (input.headers["set-cookie"]) {
      // fast-path for node.js (which automatically normalizes header names to lower-case)
      input = input.headers["set-cookie"];
    } else {
      // slow-path for other environments - see #25
      var sch =
        input.headers[
          Object.keys(input.headers).find(function (key) {
            return key.toLowerCase() === "set-cookie";
          })
        ];
      // warn if called on a request-like object with a cookie header rather than a set-cookie header - see #34, 36
      if (!sch && input.headers.cookie && !options.silent) {
        console.warn(
          "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
        );
      }
      input = sch;
    }
  }

  var split = options.split;
  var isArray = Array.isArray(input);

  if (split === "auto") {
    split = !isArray;
  }

  if (!isArray) {
    input = [input];
  }

  input = input.filter(isNonEmptyString);

  if (split) {
    input = input.map(splitCookiesString).flat();
  }

  if (!options.map) {
    return input
      .map(function (str) {
        return parseString(str, options);
      })
      .filter(Boolean);
  } else {
    var cookies = createNullObj();
    return input.reduce(function (cookies, str) {
      var cookie = parseString(str, options);
      if (cookie && !isForbiddenKey(cookie.name)) {
        cookies[cookie.name] = cookie;
      }
      return cookies;
    }, cookies);
  }
}

/*
  Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
  that are within a single set-cookie field-value, such as in the Expires portion.

  This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2
  Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128
  React Native's fetch does this for *every* header, including set-cookie.

  Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25
  Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation
*/
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString;
  }
  if (typeof cookiesString !== "string") {
    return [];
  }

  var cookiesStrings = [];
  var pos = 0;
  var start;
  var ch;
  var lastComma;
  var nextStart;
  var cookiesSeparatorFound;

  function skipWhitespace() {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  }

  function notSpecialChar() {
    ch = cookiesString.charAt(pos);

    return ch !== "=" && ch !== ";" && ch !== ",";
  }

  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        // ',' is a cookie separator if we have later first '=', not ';' or ','
        lastComma = pos;
        pos += 1;

        skipWhitespace();
        nextStart = pos;

        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }

        // currently special character
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          // we found cookies separator
          cookiesSeparatorFound = true;
          // pos is inside the next cookie, so back up and return it.
          pos = nextStart;
          cookiesStrings.push(cookiesString.substring(start, lastComma));
          start = pos;
        } else {
          // in param ',' or param separator ';',
          // we continue from that comma
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
    }
  }

  return cookiesStrings;
}

function defaultDateParser(dateStr) {
  return parseHttpDate(dateStr) || new Date(dateStr);
}

var MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * HTTP-date parser (RFC 1123 / RFC 850 / asctime)
 * Mainly here for versions of React Native where the built-in Date function can't reliably parse this format.
 *
 * @param {string} dateStr
 * @returns {Date | undefined}
 */
function parseHttpDate(dateStr) {
  if (typeof dateStr !== "string") {
    return undefined;
  }

  // Matches RFC 1123 ("Wed, 21 Oct 2025 07:28:00 GMT"),
  // RFC 850 ("Wednesday, 21-Oct-25 07:28:00 GMT"),

  // and ANSI C's asctime() ("Wed Oct 21 07:28:00 2025")
  var match = dateStr.match(
    /(?:[A-Za-z]{3,9},\s+)?(?:(\d{1,2})[- \s]+([A-Za-z]{3})[- \s]+(\d{2,4})|([A-Za-z]{3})[- \s]+(\d{1,2}))\s+(\d{2}):(\d{2}):(\d{2})(?:\s+GMT)?/i
  );

  if (!match) {
    return undefined;
  }

  var day, monthStr, year;

  if (match[1] !== undefined) {
    // Standard formats: "21 Oct 2025" or "21-Oct-25"
    day = parseInt(match[1], 10);
    monthStr = match[2].toLowerCase();
    year = parseInt(match[3], 10);

    // Handle 2-digit years (RFC 850 / RFC 6265 § 5.1.1)
    if (year < 100) {
      year += year >= 70 ? 1900 : 2000;
    }
  } else {
    // asctime() format: "Oct 21 ... 2025"
    monthStr = match[4].toLowerCase();
    day = parseInt(match[5], 10);

    var yearMatch = dateStr.match(/\d{4}$/);

    year = parseInt(yearMatch ? yearMatch[0] : "0", 10);
  }

  var month = MONTHS[monthStr];
  var hours = parseInt(match[6], 10);
  var minutes = parseInt(match[7], 10);
  var seconds = parseInt(match[8], 10);

  if (month === undefined || isNaN(year) || isNaN(day)) {
    return undefined;
  }

  var epochMs = Date.UTC(year, month, day, hours, minutes, seconds);

  return new Date(epochMs);
}

// named export for CJS
parseSetCookie.parseSetCookie = parseSetCookie;
// for backwards compatibility
parseSetCookie.parse = parseSetCookie;
parseSetCookie.parseString = parseString;
parseSetCookie.splitCookiesString = splitCookiesString;

// EXPORTS
// (this section is replaced by build-cjs.js)

// named export for ESM
export { parseSetCookie };
// for backwards compatibility
export default parseSetCookie;
export { parseSetCookie as parse, parseString, splitCookiesString };
