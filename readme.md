
Aggr
====

[![Build Status](https://secure.travis-ci.org/sorensen/aggr.png)](http://travis-ci.org/sorensen/aggr) 

Object aggregation for node! This lib will essentially combine objects so long 
as they are overlapping within a single process tick.

Usage
-----

```js
var aggr = require('aggr')
```

### aggr(namespace, data, [options], callback)

* `namespace` - String namespace to prevent collisions
* `data` - Data to aggregate, default type is object unless custom `iterator` is used
* `options` - Change the default behavior of aggr (optional)
* `callback` - Invoked when aggregation is completed

### options

* `extra` - custom callback to use in place of all callbacks after the first (default, `false`)
* `noop` - ignore all callbacks after the first (default, `false`)
* `iterator` - custom function to deal with each data aggregation (default, `extend`)
* `duration` - set a time duration for when to stop aggregating (default, 0)
* `debounce` - if using duration, set to reset the timer each call (default, `false`)

### iterator

If using a custom `iterator`, note that the very first argument will be `undefined`. 
The default `iterator` is an object extend function, and it is assumed that objects 
are being passed in unless this option is set.

```js
var ns = 'adding'

function add(a, b) {
  // First execution, `a` === `undefined`
  return (a || 0) + b
}

// This will be called 3 times with the final `total`
function done(total) {
  // total === `10`
}

var opt = {iterator: add}

aggr(ns, 4, opt, done)
aggr(ns, 5, opt, done)
aggr(ns, 1, opt, done)
```

### extra and noop (no operation)

Sometimes only a single callback is needed, you can enable this behavior by passing 
in `noop` in the options, or an `extra` function to handle this.

```js
var ns = 'no-operations'
  , opt = {noop: true}

// This function will only be called once
function done(all) {
  // all === {one: 1, two: 2, three: 3}
}
aggr(ns, {one: 1}, opt, done)   // Uses the callback
aggr(ns, {two: 2}, opt, done)   // No operation callback
aggr(ns, {three: 3}, opt, done) // No operation callback
```

Example
-------

```js
var ns = 'test'

// This will be called 4 times, one for each aggr call
function done(obj) {
  // combined data sent to callback
  // obj === {a: 'a', b: 'b', c: 10}
}
aggr(ns, {a: 'a'}, done)
aggr(ns, {b: 'b'}, done)
aggr(ns, {c: 'c'}, done)
aggr(ns, {c: 10}, done)
```


Install
-------

With [npm](https://npmjs.org)

```
npm install aggr
```


License
-------

(The MIT License)

Copyright (c) 2013 Beau Sorensen <mail@beausorensen.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
