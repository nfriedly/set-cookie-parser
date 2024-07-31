"use strict";
var assert = require("assert");
var setCookie = require("../lib/set-cookie.js");

describe("set-cookie-parser", function () {
  it("should parse a simple set-cookie header", function () {
    var actual = setCookie.parse("foo=bar;");
    var expected = [{ name: "foo", value: "bar" }];
    assert.deepEqual(actual, expected);
  });

  it("should return empty array on falsy input", function () {
    var cookieStr = "";
    var actual = setCookie.parse(cookieStr);
    var expected = [];
    assert.deepEqual(actual, expected);

    cookieStr = null;
    actual = setCookie.parse(cookieStr);
    expected = [];
    assert.deepEqual(actual, expected);

    cookieStr = undefined;
    actual = setCookie.parse(cookieStr);
    expected = [];
    assert.deepEqual(actual, expected);
  });

  it("should parse a complex set-cookie header", function () {
    var cookieStr =
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure; Partitioned";
    var actual = setCookie.parse(cookieStr);
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
    var actual = setCookie.parse(cookieStr);
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
    var actual = setCookie.parse(cookieStr);
    var expected = [
      { name: "foo", value: "asdf;asdf=true;asdf=asdf;asdf=true@asdf" },
    ];
    assert.deepEqual(actual, expected);

    actual = setCookie.parse(cookieStr, { decodeValues: false });
    expected = [
      {
        name: "foo",
        value: "asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf",
      },
    ];
    assert.deepEqual(actual, expected);

    actual = setCookie.parse(cookieStr, { decodeValues: true });
    expected = [
      { name: "foo", value: "asdf;asdf=true;asdf=asdf;asdf=true@asdf" },
    ];
    assert.deepEqual(actual, expected);
  });

  it("should handle the case when value is not UTF-8 encoded", function () {
    var cookieStr =
      "foo=R%F3r%EB%80%8DP%FF%3B%2C%23%9A%0CU%8E%A2C8%D7%3C%3C%B0%DF%17%60%F7Y%DB%16%8BQ%D6%1A";
    var actual = setCookie.parse(cookieStr, { decodeValues: true });
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
    var actual = setCookie.parse(cookieStrs);
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
    var actual = setCookie.parse(mockResponse);
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
    var actual = setCookie.parse(mockResponse);
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
    var actual = setCookie.parse(mockResponse);
    var expected = [];
    assert.deepEqual(actual, expected);
  });

  it("should return object of cookies when result option is set to map", function () {
    var cookieStr =
      "foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure";
    var actual = setCookie.parse(cookieStr, { map: true });
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
    var actual = setCookie.parse(cookieStr, { map: true });
    var expected = {};
    assert.deepEqual(actual, expected);

    cookieStr = null;
    actual = setCookie.parse(cookieStr, { map: true });
    expected = {};
    assert.deepEqual(actual, expected);

    cookieStr = undefined;
    actual = setCookie.parse(cookieStr, { map: true });
    expected = {};
    assert.deepEqual(actual, expected);
  });

  it("should have empty name string, and value is the name-value-pair if the name-value-pair string lacks a = character", function () {
    var actual = setCookie.parse("foo;");
    var expected = [{ name: "", value: "foo" }];

    assert.deepEqual(actual, expected);

    actual = setCookie.parse("foo;SameSite=None;Secure");
    expected = [{ name: "", value: "foo", sameSite: "None", secure: true }];
    assert.deepEqual(actual, expected);
  });
});
