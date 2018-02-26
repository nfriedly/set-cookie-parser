'use strict';

var defaultParseOptions = {
  decodeValues: true
};

function extend(target, source) {
  return Object.keys(source).reduce(function (target, key) {
    target[key] = source[key];
    return target;
  }, target);
}

function isNonEmptyString(str) {
  return typeof str == 'string' && !!str.trim();
}

function parseString(setCookieValue, options) {
  var parts = setCookieValue.split(';').filter(isNonEmptyString);
  var nameValue = parts.shift().split("=");
  var name = nameValue.shift();
  var value = nameValue.join("="); // everything after the first =, joined by a "=" if there was more than one part
  var cookie = {
    name: name, // grab everything before the first =
    value: options.decodeValues ? decodeURIComponent(value) : value // decode cookie value
  };

  parts.forEach(function (part) {
    var sides = part.split("=");
    var key = sides.shift().trimLeft().toLowerCase();
    var value = sides.join("=");
    if (key == "expires") {
      cookie.expires = new Date(value);
    } else if (key == 'max-age') {
      cookie.maxAge = parseInt(value, 10);
    } else if (key == 'secure') {
      cookie.secure = true;
    } else if (key == 'httponly') {
      cookie.httpOnly = true;
    } else if (key == 'samesite') {
      cookie.sameSite = value;
    } else {
      cookie[key] = value;
    }
  });

  return cookie;
}

function parse(input, options) {
  if (!input) {
    return [];
  }
  if (input.headers) {
    input = input.headers['set-cookie'];
  }
  if (!Array.isArray(input)) {
    input = [input];
  }

  var defaultOptions = extend({}, defaultParseOptions);
  if (options) {
    options = extend(defaultOptions, options);
  } else {
    options = defaultOptions;
  }

  return input.filter(isNonEmptyString).map(function (str) {
    return parseString(str, options);
  });
}

module.exports = parse;
module.exports.parse = parse;
