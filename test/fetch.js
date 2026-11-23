import assert from "node:assert";
import setCookie from "../lib/set-cookie.js";

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

  describe("Headers without getSetCookie", () => {
    function legacyResponse(value) {
      const response = new Response(null, {
        headers: value === null ? {} : { "set-cookie": value },
      });
      // Older fetch implementations expose get(), but not getSetCookie().
      Object.defineProperty(response.headers, "getSetCookie", {
        value: undefined,
      });
      return response;
    }

    it("should parse a combined header without splitting the Expires date", () => {
      const response = legacyResponse(
        "foo=bar; Expires=Tue, 01 Jul 2025 10:01:11 GMT, baz=qux; Secure"
      );
      assert.deepEqual(setCookie.parse(response), [
        {
          name: "foo",
          value: "bar",
          expires: new Date("2025-07-01T10:01:11Z"),
        },
        { name: "baz", value: "qux", secure: true },
      ]);
    });

    it("should honor map and decoding options", () => {
      const response = legacyResponse("foo=hello%20world");
      assert.deepEqual(
        setCookie.parse(response, { map: true, decodeValues: false }),
        {
          foo: { name: "foo", value: "hello%20world" },
        }
      );
    });

    it("should return an empty array when the header is absent", () => {
      assert.deepEqual(setCookie.parse(legacyResponse(null)), []);
    });
  });
});
