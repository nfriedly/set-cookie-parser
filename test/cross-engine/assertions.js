// Assertions that must hold identically under every supported JavaScript
// engine. Inlined into test/cross-engine/bundle.js by build.js, so this file
// must be ES5-compatible and must not use any module syntax.

/* global parseSetCookie */

var log = typeof print === "function" ? print : console.log;

// Hermes defines HermesInternal; the JSC shell defines readFile; node defines
// process. All three also provide globalThis, so none of these shadow each
// other.
var engine =
  typeof HermesInternal !== "undefined"
    ? "hermes"
    : typeof readFile === "function"
      ? "javascriptcore"
      : typeof process !== "undefined" &&
          process.versions &&
          process.versions.node
        ? "node (V8)"
        : "unknown engine";

var failures = 0;

function fail(message, actual, expected) {
  failures += 1;
  log(
    "  FAIL [" +
      engine +
      "] " +
      message +
      "\n         expected: " +
      expected +
      "\n         actual:   " +
      actual
  );
}

function assertEqual(message, actual, expected) {
  if (actual !== expected) {
    fail(message, actual, expected);
  }
}

function parseExpires(dateStr) {
  var cookies = parseSetCookie("foo=bar; Expires=" + dateStr);
  assertEqual(
    "'" + dateStr + "' should parse to one cookie",
    cookies.length,
    1
  );
  if (cookies.length !== 1) {
    return null;
  }
  return cookies[0].expires;
}

// RFC 6265 section 5.1.1 lists three date formats senders may use. All of them
// are legal on the wire, so all of them have to produce the right instant.
assertEqual(
  "2025-10-21T07:28:00.000Z should parse",
  parseExpires("Tue, 21 Oct 2025 07:28:00 GMT").getTime(),
  1761031680000
);

assertEqual(
  "'Wednesday, 21-Oct-25 07:28:00 GMT' (RFC 850, 2-digit year) should parse to 2025",
  parseExpires("Wednesday, 21-Oct-25 07:28:00 GMT").getTime(),
  1761031680000
);

// asctime() carries no timezone, and RFC 6265 section 5.1.1 says it is always
// GMT. Node's built-in parser instead reads it as local time, which makes its
// result depend on the machine's TZ setting - so the expected value below is
// computed with Date.UTC rather than hardcoded.
assertEqual(
  "'Wed Oct 21 07:28:00 2025' (asctime) should parse as UTC",
  parseExpires("Wed Oct 21 07:28:00 2025").getTime(),
  Date.UTC(2025, 9, 21, 7, 28, 0)
);

// The exact string from issue #35.
assertEqual(
  "'Thu, 26-Mar-2020 07:55:35 GMT' (issue #35) should parse",
  parseExpires("Thu, 26-Mar-2020 07:55:35 GMT").getTime(),
  1585209335000
);

// Two-digit years resolve per RFC 6265 section 5.1.1: >= 70 means 19xx.
assertEqual(
  "'Thursday, 26-Mar-20 07:55:35 GMT' (2-digit year 20) should resolve to 2020",
  parseExpires("Thursday, 26-Mar-20 07:55:35 GMT").getTime(),
  1585209335000
);

assertEqual(
  "'Monday, 26-Mar-95 07:55:35 GMT' (2-digit year 95) should resolve to 1995",
  parseExpires("Monday, 26-Mar-95 07:55:35 GMT").getTime(),
  Date.UTC(1995, 2, 26, 7, 55, 35)
);

// Unparseable values still yield an Invalid Date rather than throwing.
var invalid = parseExpires("not a date at all");
assertEqual(
  "'not a date at all' should not throw",
  invalid instanceof Date,
  true
);
assertEqual(
  "'not a date at all' should be an Invalid Date",
  isNaN(invalid.getTime()),
  true
);

// A `parseDate` override replaces the built-in parsing entirely.
var overrideCalls = [];
var overrideCookies = parseSetCookie(
  "foo=bar; Expires=Thu, 26-Mar-2020 07:55:35 GMT",
  {
    parseDate: function (str) {
      overrideCalls.push(str);
      return new Date(Date.UTC(1999, 0, 1));
    },
  }
);
assertEqual(
  "parseDate should be called with the raw expires value",
  overrideCalls.join(","),
  "Thu, 26-Mar-2020 07:55:35 GMT"
);
assertEqual(
  "parseDate result should be used",
  overrideCookies[0].expires.getTime(),
  915148800000
);

// The rest of the parser is unaffected by date parsing. Comma-joining two
// headers is what React Native's fetch does (see #25), so this is the shape
// the issue was reported with.
var allCookies = parseSetCookie(
  "a=1; Expires=Tue, 21 Oct 2025 07:28:00 GMT; Path=/; HttpOnly, foo=bar; Expires=Wed Oct 21 07:28:00 2025; Secure"
);
assertEqual("should split comma-joined cookies", allCookies.length, 2);
assertEqual(
  "should keep names",
  allCookies[0].name + "," + allCookies[1].name,
  "a,foo"
);
assertEqual(
  "should keep expires on the first cookie",
  allCookies[0].expires.getTime(),
  1761031680000
);
assertEqual(
  "should keep expires on the second cookie",
  allCookies[1].expires.getTime(),
  Date.UTC(2025, 9, 21, 7, 28, 0)
);
assertEqual("should keep path", allCookies[0].path, "/");
assertEqual("should keep httpOnly", allCookies[0].httpOnly, true);
assertEqual("should keep secure", allCookies[1].secure, true);

if (failures > 0) {
  log("FAILED: " + failures + " assertion(s) failed on " + engine + "\n");
  if (typeof print === "function") {
    throw new Error(failures + " assertion(s) failed on " + engine);
  }
  process.exitCode = 1;
} else {
  log("PASSED: all assertions passed on " + engine + "\n");
}
