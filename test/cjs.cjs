const assert = require("node:assert");
const setCookie = require("../dist/set-cookie.cjs");

describe("commonJS (CJS)", function () {

    it('should export all methods', function() {
        assert(typeof setCookie === 'function');
        assert(typeof setCookie.parse === 'function');
        assert(typeof setCookie.parseString === 'function');
        assert(typeof setCookie.splitCookiesString === 'function');
    });

    it('default export should work', function() {
        var actual = setCookie("foo=bar;");
        var expected = [{ name: "foo", value: "bar" }];
        assert.deepEqual(actual, expected);
    });

    it('named export should work', function() {
        var actual = setCookie.parse("foo=bar;");
        var expected = [{ name: "foo", value: "bar" }];
        assert.deepEqual(actual, expected);
    });
});