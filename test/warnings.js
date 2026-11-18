import sinon from "sinon";
import setCookie from "../lib/set-cookie.js";

describe("warnings", function () {
  var sandbox = sinon.createSandbox();

  afterEach(function () {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  // see #34, #36
  it("should log a warning on request-like objects", function () {
    sandbox.stub(console, "warn");

    var mockRequest = {
      headers: {
        cookie: "bam=baz; foo=bar",
      },
    };

    setCookie.parse(mockRequest);

    sandbox.assert.calledOnce(console.warn);
  });

  it("should not log a warning on request-like objects when slient: true is set", function () {
    sandbox.stub(console, "warn");

    var mockRequest = {
      headers: {
        cookie: "bam=baz; foo=bar",
      },
    };

    setCookie.parse(mockRequest, {
      silent: true,
    });

    sandbox.assert.notCalled(console.warn);
  });

  it("should log a warning when a time zone in expires is ignored", function () {
    [
      "Wed, 21 Oct 2026 07:28:00 PST",
      "Wed, 21 Oct 2026 07:28:00 +0200",
      "Wed, 21 Oct 2026 07:28:00 -07:00",
      "Wed, 21 Oct 2026 07:28:00 GMT+2",
      "Wed, 21 Oct 2026 07:28:00 EST5EDT",
      "Wed, 21 Oct 2026 07:28:00 CST6CDT",
      "Wed, 21 Oct 2026 07:28:00 MST7MDT",
      "Wed, 21 Oct 2026 07:28:00 pst8pdt",
    ].forEach(function (expires) {
      sandbox.stub(console, "warn");
      setCookie.parse("foo=bar; Expires=" + expires);
      sandbox.assert.calledOnce(console.warn);
      sandbox.assert.calledWith(
        console.warn,
        sinon.match("ignoring time zone"),
        expires
      );
      sandbox.restore();
    });
  });

  it("should not log a warning for UTC or zone-less expires dates", function () {
    sandbox.stub(console, "warn");
    [
      "Wed, 21 Oct 2026 07:28:00 GMT",
      "Wed, 21 Oct 2026 07:28:00 UTC",
      "Wed, 21 Oct 2026 07:28:00 UT",
      "Wed, 21 Oct 2026 07:28:00 Z",
      "Wed, 21 Oct 2026 07:28:00 +0000",
      "Wednesday, 21-Oct-26 07:28:00 GMT",
      "Wed Oct 21 07:28:00 2026",
      "2026-10-21T07:28:00Z",
    ].forEach(function (expires) {
      setCookie.parse("foo=bar; Expires=" + expires);
    });
    sandbox.assert.notCalled(console.warn);
  });

  it("should not log a warning for an ignored expires time zone when silent: true is set", function () {
    sandbox.stub(console, "warn");
    setCookie.parse("foo=bar; Expires=Wed, 21 Oct 2026 07:28:00 PST", {
      silent: true,
    });
    sandbox.assert.notCalled(console.warn);
  });
});
