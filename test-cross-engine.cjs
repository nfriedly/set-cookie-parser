var log = typeof print === 'function' ? print : console.log;

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error("FAIL: " + message + " | Expected: " + expected + ", Got: " + actual);
  }
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

log("Starting cross-engine date parsing tests...");

var mod = require('./dist/set-cookie.cjs');
var parseSetCookie = mod.parseSetCookie || mod.parse || mod.default || mod;
if (typeof parseSetCookie !== 'function') {
  throw new Error('parseSetCookie not found');
}

// Issue #35 case
var res = parseSetCookie('foo=bar; Expires=Thu, 26-Mar-2020 07:55:35 GMT');
var d = res[0].expires;
if (!isValidDate(d)) {
  throw new Error('FAIL: Issue #35 case returned invalid date');
}
assertEqual(d.getTime(), Date.UTC(2020, 2, 26, 7, 55, 35), 'Issue #35 timestamp match');

log("SUCCESS: All date parsing tests passed!");
