import assert from "node:assert";
import { parseSetCookie } from "../lib/set-cookie.js";

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

  it("should parse expires using the RFC 6265 date formats", function () {
    // RFC 6265 section 5.1.1 lists three formats senders may use. Node's
    // built-in Date handles all three, but Hermes cannot parse asctime() at all
    // and reads two-digit years as 19xx - see #35 and the cross-engine tests in
    // test/cross-engine.
    var formats = [
      "Tue, 21 Oct 2025 07:28:00 GMT", // RFC 1123
      "Tuesday, 21-Oct-25 07:28:00 GMT", // RFC 850
      "Tue Oct 21 07:28:00 2025", // asctime()
      "Thu, 26-Mar-2020 07:55:35 GMT", // the string from #35
    ];
    formats.forEach(function (format) {
      var actual = parseSetCookie("foo=bar; Expires=" + format);
      var expected = [
        {
          name: "foo",
          value: "bar",
          expires: new Date(Date.UTC(2025, 9, 21, 7, 28, 0)),
        },
      ];
      if (format.indexOf("2020") !== -1) {
        expected[0].expires = new Date(Date.UTC(2020, 2, 26, 7, 55, 35));
      }
      assert.deepEqual(actual, expected, "failed to parse " + format);
    });
  });

  it("should resolve two-digit years per RFC 6265 section 5.1.1", function () {
    // Years 70-99 mean 19xx, everything else means 20xx.
    var cases = [
      ["Thursday, 26-Mar-20 07:55:35 GMT", Date.UTC(2020, 2, 26, 7, 55, 35)],
      ["Monday, 26-Mar-95 07:55:35 GMT", Date.UTC(1995, 2, 26, 7, 55, 35)],
      ["Monday, 26-Mar-70 07:55:35 GMT", Date.UTC(1970, 2, 26, 7, 55, 35)],
      ["Monday, 26-Mar-69 07:55:35 GMT", Date.UTC(2069, 2, 26, 7, 55, 35)],
    ];
    cases.forEach(function (testCase) {
      var actual = parseSetCookie("foo=bar; Expires=" + testCase[0]);
      assert.equal(actual[0].expires.getTime(), testCase[1], testCase[0]);
    });
  });

  it("should use a custom parseDate function when provided", function () {
    var calls = [];
    var actual = parseSetCookie(
      "foo=bar; Expires=Thu, 26-Mar-2020 07:55:35 GMT",
      {
        parseDate: function (dateStr) {
          calls.push(dateStr);
          return new Date(Date.UTC(1999, 0, 1));
        },
      }
    );
    assert.deepEqual(calls, ["Thu, 26-Mar-2020 07:55:35 GMT"]);
    assert.deepEqual(actual, [
      {
        name: "foo",
        value: "bar",
        expires: new Date(Date.UTC(1999, 0, 1)),
      },
    ]);
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
