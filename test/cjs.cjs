const assert = require("node:assert");
const parseSetCookie = require("../dist/set-cookie.cjs");

describe("commonJS (CJS)", function () {

    it('should export all methods', function() {
        assert(typeof parseSetCookie === 'function');
        assert(typeof parseSetCookie.parseSetCookie === 'function');
        assert(typeof parseSetCookie.parse === 'function');
        assert(typeof parseSetCookie.parseString === 'function');
        assert(typeof parseSetCookie.splitCookiesString === 'function');
    });

    it('default export should work', function() {
        var actual = parseSetCookie("foo=bar;");
        var expected = [{ name: "foo", value: "bar" }];
        assert.deepEqual(actual, expected);
    });

    it('named export should work', function() {
        var actual = parseSetCookie.parse("foo=bar;");
        var expected = [{ name: "foo", value: "bar" }];
        assert.deepEqual(actual, expected);
    });
});