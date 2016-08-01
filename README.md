# set-cookie-parser [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Parses set-cookie headers into objects

Accepts a single `set-cookie` header value, an array of `set-cookie` header values, or a response object that may have 0 or more `set-cookie` headers.

Always returns an array of cookie objects. Each object will have, at a minimum a name and value and may have any of the other parameters depending on the set-cookie header:

* name - cookie name (string)
* value - cookie value (string)
* path - cookie path (string or undefined)
* domain - domain for the cookie (string or undefined, may begin with "." to indicate the named domain or any subdomain of it)
* expires - absolute expiration date for the cookie (Date object or undefined)
* maxAge - relative max age of the cookie in seconds from when the client receives it (integer or undefined)
* secure - indicates that this cookie should only be sent over HTTPs (true or undefined)
* httpOnly - indicates that this cookie should *not* be accessible to client-side JavaScript (true or undefined)

(The output format is loosely based on the input format of https://www.npmjs.com/package/cookie)

## Install

```sh
$ npm install --save set-cookie-parser
```


## Usage

```js
var http = require('http');
var setCookie = require('set-cookie-parser');

http.get('http://example.com', function(req) {
  var cookies = setCookie.parse(req);
  
  cookies.forEach(console.log);
}
```

Example output:

```js
[
    {
        name: 'bam',
        value: 'baz'
    },
    {
        name: 'foo',
        value: 'bar',
        path: '/',
        expires: new Date('Tue Jul 01 2025 06:01:11 GMT-0400 (EDT)'),
        maxAge: 1000,
        domain: '.example.com',
        secure: true,
        httpOnly: true
    }
]
```

## License

MIT © [Nathan Friedly]()


[npm-image]: https://badge.fury.io/js/set-cookie-parser.svg
[npm-url]: https://npmjs.org/package/set-cookie-parser
[travis-image]: https://travis-ci.org/nfriedly/set-cookie-parser.svg?branch=master
[travis-url]: https://travis-ci.org/nfriedly/set-cookie-parser
[daviddm-image]: https://david-dm.org/nfriedly/set-cookie-parser.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/nfriedly/set-cookie-parser
