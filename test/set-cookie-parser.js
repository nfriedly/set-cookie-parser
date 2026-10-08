import assert from "node:assert";
import {
  parseSetCookie,
  parseString,
  splitCookiesString,
} from "../lib/set-cookie.js";

describe("set-cookie-parser", function () {
  it("should parse a simple set-cookie header", function () {
    var actual = parseSetCookie("foo=bar;");
    var expected = [{ name: "foo", value: "bar" }];
    assert.deepEqual(actual, expected);
  });

  it("should return empty array on falsy input", function () {
    var cookieStr = "";
    var actual = parseSetCookie(cookieStr);
    var expected = [];
    assert.deepEqual(actual, expected);

    cookieStr = null;
    actual = parseSetCookie(cookieStr);
    expected = [];
    assert.deepEqual(actual, expected);

    cookieStr = undefined;
    actual = parseSetCookie(cookieStr);
    expected = [];
    assert.deepEqual(actual, expected);
  });

  it("should parse a complex set-cookie header", function () {
    var cookieStr =
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure; Partitioned";
    var actual = parseSetCookie(cookieStr);
    var expected = [
      {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
        partitioned: true,
      },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should parse a weird but valid cookie", function () {
    var cookieStr =
      "foo=bar=bar&foo=foo&John=Doe&Doe=John; Max-Age=1000; Domain=.example.com; Path=/; HttpOnly; Secure";
    var actual = parseSetCookie(cookieStr);
    var expected = [
      {
        name: "foo",
        value: "bar=bar&foo=foo&John=Doe&Doe=John",
        path: "/",
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
      },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should parse a cookie with percent-encoding in the data", function () {
    var cookieStr = "foo=asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf";
    var actual = parseSetCookie(cookieStr);
    var expected = [
      { name: "foo", value: "asdf;asdf=true;asdf=asdf;asdf=true@asdf" },
    ];
    assert.deepEqual(actual, expected);

    actual = parseSetCookie(cookieStr, { decodeValues: false });
    expected = [
      {
        name: "foo",
        value: "asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf",
      },
    ];
    assert.deepEqual(actual, expected);

    actual = parseSetCookie(cookieStr, { decodeValues: true });
    expected = [
      { name: "foo", value: "asdf;asdf=true;asdf=asdf;asdf=true@asdf" },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should handle the case when value is not UTF-8 encoded", function () {
    var cookieStr =
      "foo=R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A";
    var actual = parseSetCookie(cookieStr, { decodeValues: true });
    var expected = [
      {
        name: "foo",
        value:
          "R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A",
      },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should work on an array of headers", function () {
    var cookieStrs = [
      "bam=baz",
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure",
    ];
    var actual = parseSetCookie(cookieStrs);
    var expected = [
      { name: "bam", value: "baz" },
      {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
      },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should work on response objects", function () {
    var mockResponse = {
      headers: {
        "set-cookie": [
          "bam=baz",
          "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure; SameSite=strict",
        ],
      },
    };
    var actual = parseSetCookie(mockResponse);
    var expected = [
      { name: "bam", value: "baz" },
      {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should work with strangely capitalized set-cookie key", function () {
    var mockResponse = {
      headers: {
        "sEt-CookIe": [
          "bam=baz",
          "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure; SameSite=strict",
        ],
      },
    };
    var actual = parseSetCookie(mockResponse);
    var expected = [
      { name: "bam", value: "baz" },
      {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should work on response objects that don't have any set-cookie headers", function () {
    var mockResponse = {
      headers: {},
    };
    var actual = parseSetCookie(mockResponse);
    var expected = [];
    assert.deepEqual(actual, expected);
  });

  it("should return object of cookies when result option is set to map", function () {
    var cookieStr =
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure";
    var actual = parseSetCookie(cookieStr, { map: true });
    var expected = {
      foo: {
        name: "foo",
        value: "bar",
        path: "/",
        expires: new Date("Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)"),
        maxAge: 1000,
        domain: ".example.com",
        secure: true,
        httpOnly: true,
      },
    };
    assert.deepEqual(actual, expected);
  });

  it("should return empty object on falsy input when result options is set to map", function () {
    var cookieStr = "";
    var actual = parseSetCookie(cookieStr, { map: true });
    var expected = {};
    assert.deepEqual(actual, expected);

    cookieStr = null;
    actual = parseSetCookie(cookieStr, { map: true });
    expected = {};
    assert.deepEqual(actual, expected);

    cookieStr = undefined;
    actual = parseSetCookie(cookieStr, { map: true });
    expected = {};
    assert.deepEqual(actual, expected);
  });

  it("should have empty name string, and value is the name-value-pair if the name-value-pair string lacks a = character", function () {
    var actual = parseSetCookie("foo;");
    var expected = [{ name: "", value: "foo" }];

    assert.deepEqual(actual, expected);

    actual = parseSetCookie("foo;SameSite=None;Secure");
    expected = [{ name: "", value: "foo", sameSite: "None", secure: true }];
    assert.deepEqual(actual, expected);
  });

  it("should ignore a set-cookie string with no name-value-pair instead of throwing", function () {
    assert.deepEqual(parseSetCookie(";"), []);
    assert.deepEqual(parseSetCookie("   ;   "), []);
    assert.deepEqual(parseSetCookie([";", "foo=bar"]), [
      { name: "foo", value: "bar" },
    ]);
    assert.deepEqual(parseSetCookie(";", { map: true }), {});
  });

  it("should skip cookies that could pollute the object prototype", function () {
    var actual = parseSetCookie("__proto__=test;");
    var expected = [];
    assert.deepEqual(actual, expected);

    actual = parseSetCookie("foo;__proto__=None;Secure");
    expected = [{ name: "", value: "foo", secure: true }];
    assert.deepEqual(actual, expected);

    actual = parseSetCookie("__proto__=test;", { map: true });
    expected = {};
    assert.deepEqual(actual, expected);
  });

  it("should trim whitespace around attribute names and values (rfc 6265 5.2 step 3)", function () {
    var actual = parseSetCookie(
      "foo=bar; Domain= .example.com; Path= /admin; SameSite= Lax"
    );
    var expected = [
      {
        name: "foo",
        value: "bar",
        domain: ".example.com",
        path: "/admin",
        sameSite: "Lax",
      },
    ];
    assert.deepEqual(actual, expected);

    actual = parseSetCookie("foo=bar; Domain=.example.com ; Path=/ ");
    expected = [
      { name: "foo", value: "bar", domain: ".example.com", path: "/" },
    ];
    assert.deepEqual(actual, expected);

    actual = parseSetCookie("foo=bar; Secure ");
    expected = [{ name: "foo", value: "bar", secure: true }];
    assert.deepEqual(actual, expected);

    actual = parseSetCookie("foo=bar; Path =/x");
    expected = [{ name: "foo", value: "bar", path: "/x" }];
    assert.deepEqual(actual, expected);
  });

  describe("name-value-pair whitespace (rfc 6265 5.2)", function () {
    it("should trim leading whitespace from the name", function () {
      assert.deepEqual(parseSetCookie(" session=abc; Path=/"), [
        { name: "session", value: "abc", path: "/" },
      ]);
    });

    it("should trim trailing whitespace from the value", function () {
      assert.deepEqual(parseSetCookie("session=abc ; Path=/"), [
        { name: "session", value: "abc", path: "/" },
      ]);
      assert.deepEqual(parseSetCookie("a=b ;Path=/"), [
        { name: "a", value: "b", path: "/" },
      ]);
    });

    it("should trim whitespace around the = sign", function () {
      assert.deepEqual(parseSetCookie("session = abc; Path=/"), [
        { name: "session", value: "abc", path: "/" },
      ]);
    });

    it("should trim tabs but not other unicode whitespace", function () {
      assert.deepEqual(parseSetCookie("\ta\t=\tb\t; Path=/"), [
        { name: "a", value: "b", path: "/" },
      ]);
      // only WSP (SP / HTAB) is trimmed, per the rfc
      assert.deepEqual(
        parseSetCookie("a=\u00a0b\u00a0", { decodeValues: false }),
        [{ name: "a", value: "\u00a0b\u00a0" }]
      );
    });

    it("should trim before decoding", function () {
      assert.deepEqual(parseSetCookie("a= b%20c "), [
        { name: "a", value: "b c" },
      ]);
      // an encoded space is data, not whitespace, so it is kept
      assert.deepEqual(parseSetCookie("a=%20b%20 "), [
        { name: "a", value: " b " },
      ]);
      assert.deepEqual(parseSetCookie("a= b%20c ", { decodeValues: false }), [
        { name: "a", value: "b%20c" },
      ]);
    });

    it("should trim in parseString", function () {
      assert.deepEqual(parseString("  a  =  b  ; Secure"), {
        name: "a",
        value: "b",
        secure: true,
      });
    });

    it("should trim when splitting combined headers", function () {
      var combined =
        "a=1 ; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT, b=2 ; Secure";
      assert.deepEqual(splitCookiesString(combined), [
        "a=1 ; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT",
        "b=2 ; Secure",
      ]);
      assert.deepEqual(parseSetCookie(combined), [
        {
          name: "a",
          value: "1",
          path: "/",
          expires: new Date("Wed, 21 Oct 2026 07:28:00 GMT"),
        },
        { name: "b", value: "2", secure: true },
      ]);
    });

    it("should trim when building a map", function () {
      assert.deepEqual(parseSetCookie(" a = b ", { map: true }), {
        a: { name: "a", value: "b" },
      });
    });

    it("should preserve whitespace inside the name and value", function () {
      assert.deepEqual(parseSetCookie("a=b c"), [{ name: "a", value: "b c" }]);
      assert.deepEqual(parseSetCookie(" a=  b   c  "), [
        { name: "a", value: "b   c" },
      ]);
      assert.deepEqual(parseSetCookie("a b=c"), [{ name: "a b", value: "c" }]);
    });

    it("should keep everything after the first = in the value", function () {
      assert.deepEqual(parseSetCookie("a=b=c"), [{ name: "a", value: "b=c" }]);
      assert.deepEqual(parseSetCookie("a = b = c "), [
        { name: "a", value: "b = c" },
      ]);
    });

    it("should not strip quotes, only whitespace", function () {
      assert.deepEqual(parseSetCookie('a="b" '), [{ name: "a", value: '"b"' }]);
      assert.deepEqual(parseSetCookie('a=" b "'), [
        { name: "a", value: '" b "' },
      ]);
    });

    it("should still follow 6265bis for nameless cookies", function () {
      assert.deepEqual(parseSetCookie("abc ; Path=/"), [
        { name: "", value: "abc", path: "/" },
      ]);
      assert.deepEqual(parseSetCookie("  abc"), [{ name: "", value: "abc" }]);
      assert.deepEqual(parseSetCookie("  =abc"), [{ name: "", value: "abc" }]);
      assert.deepEqual(parseSetCookie("=abc"), [{ name: "", value: "abc" }]);
      assert.deepEqual(parseSetCookie("foo;"), [{ name: "", value: "foo" }]);
    });

    it("should handle an all-whitespace value", function () {
      assert.deepEqual(parseSetCookie("a=   ; Path=/"), [
        { name: "a", value: "", path: "/" },
      ]);
    });
  });

  describe("split option", function () {
    const cookieA = "a=b";
    const cookieB = "b=c";
    const cookieC = "c=d";
    const combinedCookies = `${cookieA}, ${cookieB}`;

    it("should split when true", function () {
      var actual = parseSetCookie(combinedCookies, { split: true });
      var expected = [
        { name: "a", value: "b" },
        { name: "b", value: "c" },
      ];
      assert.deepEqual(actual, expected);
    });

    it("should not split when false", function () {
      var actual = parseSetCookie(combinedCookies, { split: false });
      var expected = [{ name: "a", value: "b, b=c" }];
      assert.deepEqual(actual, expected);
    });

    it("should split strings by default", function () {
      var actual = parseSetCookie(combinedCookies);
      var expected = [
        { name: "a", value: "b" },
        { name: "b", value: "c" },
      ];
      assert.deepEqual(actual, expected);
    });

    it("should not split arrays by default", function () {
      var actual = parseSetCookie([combinedCookies, cookieC]);
      var expected = [
        { name: "a", value: "b, b=c" },
        { name: "c", value: "d" },
      ];
      assert.deepEqual(actual, expected);
    });

    it("should split arrays when true", function () {
      var actual = parseSetCookie([combinedCookies, cookieC], { split: true });
      var expected = [
        { name: "a", value: "b" },
        { name: "b", value: "c" },
        { name: "c", value: "d" },
      ];
      assert.deepEqual(actual, expected);
    });
  });
});
