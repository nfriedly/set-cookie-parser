'use strict';
var assert = require('assert');
var setCookie = require('../lib/set-cookie.js');

describe('set-cookie-parser', function () {

  it('should parse a simple set-cookie header', function () {
    var actual = setCookie.parse('foo=bar;');
    var expected = [{name: 'foo', value: 'bar'}];
    assert.deepEqual(actual, expected);
  });

  it('should parse a complex set-cookie header', function () {
    var cookieStr = 'foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure';
    var actual = setCookie.parse(cookieStr);
    var expected = [{name: 'foo', value: 'bar', path: '/', expires: new Date('Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)'), maxAge: 1000, domain: '.example.com', secure: true, httpOnly: true}];
    assert.deepEqual(actual, expected);
  });

  it('should parse a weird but valid cookie', function () {
    var cookieStr = 'foo=bar=bar&foo=foo&John=Doe&Doe=John; Max-Age=1000; Domain=.example.com; Path=/; HttpOnly; Secure';
    var actual = setCookie.parse(cookieStr);
    var expected = [{name: 'foo', value: 'bar=bar&foo=foo&John=Doe&Doe=John', path: '/', maxAge: 1000, domain: '.example.com', secure: true, httpOnly: true}];
    assert.deepEqual(actual, expected);
  });

  it('should parse a cookie with percent-encoding in the data', function () {
    var cookieStr = 'foo=asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf';
    var actual = setCookie.parse(cookieStr);
    var expected = [{name: 'foo', value: 'asdf;asdf=true;asdf=asdf;asdf=true@asdf'}];
    assert.deepEqual(actual, expected);

    actual = setCookie.parse(cookieStr, {decodeValues: false});
    expected = [{name: 'foo', value: 'asdf%3Basdf%3Dtrue%3Basdf%3Dasdf%3Basdf%3Dtrue%40asdf'}];
    assert.deepEqual(actual, expected);

    actual = setCookie.parse(cookieStr, {decodeValues: true});
    expected = [{name: 'foo', value: 'asdf;asdf=true;asdf=asdf;asdf=true@asdf'}];
    assert.deepEqual(actual, expected);
  });

  it('should work on an array of headers', function () {
    var cookieStrs = ['bam=baz', 'foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure'];
    var actual = setCookie.parse(cookieStrs);
    var expected = [
      {name: 'bam', value: 'baz'},
      {name: 'foo', value: 'bar', path: '/', expires: new Date('Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)'), maxAge: 1000, domain: '.example.com', secure: true, httpOnly: true}
    ];
    assert.deepEqual(actual, expected);
  });

  it('should work on request objects', function () {
    var mockRequest = {
      headers: {
        'set-cookie': ['bam=baz', 'foo=bar; Max-Age=1000; Domain=.example.com; Path=/; Expires=Tue, 01 Jul 2025 10:01:11 GMT; HttpOnly; Secure; SameSite=strict']
      }
    };
    var actual = setCookie.parse(mockRequest);
    var expected = [
      {name: 'bam', value: 'baz'},
      {name: 'foo', value: 'bar', path: '/', expires: new Date('Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)'), maxAge: 1000, domain: '.example.com', secure: true, httpOnly: true, sameSite: 'strict'}
    ];
    assert.deepEqual(actual, expected);
  });

  it('should work on request objects that don\'t have any set-cookie headers', function () {
    var mockRequest = {
      headers: {}
    };
    var actual = setCookie.parse(mockRequest);
    var expected = [];
    assert.deepEqual(actual, expected);
  });

});
