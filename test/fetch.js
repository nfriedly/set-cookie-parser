"use strict";
var assert = require("assert");
var setCookie = require("../lib/set-cookie.js");

describe("fetch", () => {
  before(() => {
    // conditionall skip these tests if the environment doesn't support the necessary features
    if (
      typeof fetch !== "undefined" &&
      typeof Response !== "undefined" &&
      typeof new Response().headers.getSetCookie !== "function"
    ) {
      this.skip();
    }
  });

  it("should use getSetCookie method on a Response object", () => {
    const fakeResponse = {
      headers: {
        getSetCookie: () => ["foo=bar"],
      },
    };

    var actual = setCookie.parse(fakeResponse);
    var expected = [{ name: "foo", value: "bar" }];
    assert.deepEqual(actual, expected);
  });
});
