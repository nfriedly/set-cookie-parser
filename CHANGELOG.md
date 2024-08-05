

## [v2.7.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.7.0) - 2024-08-01
* Added support for `partitioned` attribute
* Set up automatic publishing to npm from github actions, with provenance

Docs:
* Added changelog

## [v2.6.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.6.0) - 2023-05-18
* Add support for getSetCookie() method on fetch response headers objects.

### [v2.5.1](https://github.com/nfriedly/set-cookie-parser/tree/v2.5.1) - 2024-07-25
* Change name-value-pair parsing to follow 6265bis
  * When there's no `=` in the "name=value" part, now the name is '' and the value is the entire string. Previously it was the other way around.


## [v2.5.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.5.0) - 2022-06-04
* Add `"sideEffects": false` to `package.json` to help bundlers like Webpack and Rollup

## [v2.4.8](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.8) - 2021-02-26
* Revert to ES5

## [v2.4.7](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.7) - 2021-01-16
* Handle cases where `decodeURIComponent()` throws when decoding a value by logging an error and returning the original value
* Switch to ES6

## [v2.4.6](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.6) - 2020-05-30
* Return an empty object rather than an empty array for falsy input when `options.map` is enabled

## [v2.4.5](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.5) - 2020-04-04
* Document new silent option
* No functional changes

## [v2.4.4](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.4) - 2020-04-04
*  Log a warning if the library appears to have been used incorrectly on a request rather than on a response.
   * New `silent` option to suppress this behavior

## [v2.4.3](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.3) - 2020-01-29
* Fix `parseString` export, add default options

## [v2.4.2](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.2) - 2020-01-29
* Documentation improvements
* No functional changes

## [v2.4.1](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.1) - 2019-12-13
* Documentation improvements
* No functional changes

## [v2.4.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.4.0) - 2019-08-15
* Documented `parse`, `parseString`, & `splitCookiesString` methods
* Attempted but failed to export `parseString` method
* No functional changes

## [v2.3.8](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.8) - 2019-07-15
* Drop testing on node < 8 due to ESLint
* No functional changes

## [v2.3.7](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.7) - 2019-07-15 (unpublished)
* Development dependency bump
* No functional changes

## [v2.3.6](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.6) - 2019-07-15 (unpublished)
* Support arbitrary capitalization of `Set-Cookie` header name for non-node.js environments

## [v2.3.5](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.5) - 2019-01-29
* Clarify documentation of `map` option
* No functional changes

## [v2.3.4](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.4) - 2019-01-28 (unpublished)
* Fixed automated publishing to npm
* No functional changes

## [v2.3.3](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.3) - 2019-01-28 (unpublished)
* No functional changes

## [v2.3.2](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.2) - 2019-01-28 (unpublished)
* No functional changes

## [v2.3.1](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.1) - 2019-01-28 (unpublished)
* No functional changes

## [v2.3.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.3.0) - 2018-11-12 (unpublished)

* New `map` option to return an Object with cookies keyed by name rather than an array of cookies

## [v2.2.1](https://github.com/nfriedly/set-cookie-parser/tree/v2.2.1) - 2018-07-10
* Revert to ES5

## [v2.2.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.2.0) - 2018-07-08
* Add `splitCookiesString` to separate multiple comma-separated Set-Cookie headers
* Changed code from ES5 to ES6

## [v2.1.2](https://github.com/nfriedly/set-cookie-parser/tree/v2.1.2) - 2018-05-26

Docs
* Fixed a broken link

## [v2.1.1](https://github.com/nfriedly/set-cookie-parser/tree/v2.1.1) - 2018-02-26

* Updated automated release script

## [v2.1.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.1.0) - 2018-02-26

Added

* Support for `SameSite` attribute

##  [v2.0.0](https://github.com/nfriedly/set-cookie-parser/tree/v2.0.0) - 2016-12-13
* Added decodeValues option (calls `decodeURIComponent()` on each cookie value), enabled by default.
* Added `splitCookiesString` method.

## [v1.0.2](https://github.com/nfriedly/set-cookie-parser/tree/v1.0.2) - 2016-02-08

Docs:

* Update badges and keywords

## [v1.0.1](https://github.com/nfriedly/set-cookie-parser/tree/v1.0.1) - 2015-07-01

Docs:
* Added output example

## [v1.0.0](https://github.com/nfriedly/set-cookie-parser/tree/v1.0.0) - 2015-07-01

Initial release