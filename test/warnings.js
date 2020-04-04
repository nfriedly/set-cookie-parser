"use strict";
var sinon = require("sinon");
var setCookie = require("../lib/set-cookie.js");

describe("set-cookie-parser", function () {
  var sandbox = sinon.createSandbox();

  afterEach(function () {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  // see #34, #36
  it("log a warning on request-like objects", function () {
    sandbox.stub(console, "warn");

    var mockRequest = {
      headers: {
        cookie: "bam=baz; foo=bar",
      },
    };

    setCookie.parse(mockRequest);

    sandbox.assert.calledOnce(console.warn);
  });

  it("not log a warning on request-like objects when slient: true is set", function () {
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
});
