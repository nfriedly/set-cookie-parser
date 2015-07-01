'use strict';

function isNonEmptyString(str) {
  return typeof str == 'string' && !!str.trim();
}

function parseString(setCookieValue) {
  var parts = setCookieValue.split(';').filter(isNonEmptyString);
  var nameValue = parts.shift().split("=");
  var cookie = {
    name: nameValue.shift(), // grab everything before the first =
    value: nameValue.join("=") // everything after the first =, joined by a "=" if there was more than one part
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
    } else {
      cookie[key] = value;
    }
  });

  return cookie;
}

function parse(input) {
  if (!input) {
    return [];
  }
  if (input.headers) {
    input = input.headers['set-cookie'];
  }
  if (!Array.isArray(input)) {
    input = [input];
  }
  return input.filter(isNonEmptyString).map(parseString);
}

module.exports = parse;
module.exports.parse = parse;
