'use strict';

/*!
 * Module dependencies.
 */

var assert = require('assert')
  , ase = assert.strictEqual
  , ade = assert.deepEqual
  , aggr = require('./index')
  , tick = process.nextTick
  , MemoryStore = require('./example')
  , store = new MemoryStore()

var test = {
  a: 'a'
, b: 'b'
, c: 'c'
, d: 'd'
}

describe('Aggregation', function() {
  it('should combine all objects', function(done) {
    var ns = 'test'
      , len = 4

    function callback(obj) {
      ade(obj, test)
      --len || done()
    }
    aggr(ns, {d: 'd'}, callback)
    aggr(ns, {a: 'a'}, callback)
    aggr(ns, {b: 'b'}, callback)
    aggr(ns, {c: 'c'}, callback)
  })

  it('should only work for a single tick', function(done) {
    var ns = 'meow'
      , len = 4
    function callback(obj) {
      --len || done()
    }
    aggr(ns, {a: 1}, function(all) {
      ade(all, {a: 1, b: 2})
      callback()
    })
    aggr(ns, {b: 2}, function(all) {
      ade(all, {a: 1, b: 2})
      callback()
    })
    tick(function() {
      aggr(ns, {c: 3}, function(all) {
        ade(all, {c: 3, d: 4})
        callback()
      })
    })
    tick(function() {
      aggr(ns, {d: 4}, function(all) {
        ade(all, {c: 3, d: 4})
        callback()
      })
    })
  })

  it('should combine all objects while all ticking', function(done) {
    var ns = 'tick-test'
      , len = 4

    function callback(obj) {
      ade(obj, test)
      --len || done()
    }
    tick(function() { aggr(ns, {d: 'd'}, callback) })
    tick(function() { aggr(ns, {a: 'a'}, callback) })
    tick(function() { aggr(ns, {b: 'b'}, callback) })
    tick(function() { aggr(ns, {c: 'c'}, callback) })
  })

  it('should work with a custom iterator', function(done) {
    var ns = 'nums'
      , len = 4

    function add(a, b) {
      return (a || 0) + b
    }
    function callback(total) {
      ase(total, 20)
      --len || done()
    }
    aggr(ns, 1, {iterator: add}, callback)
    aggr(ns, 6, {iterator: add}, callback)
    aggr(ns, 9, {iterator: add}, callback)
    aggr(ns, 4, {iterator: add}, callback)
  })

  it('should work with a custom duration', function(done) {
    var ns = 'timeouts'
      , len = 4
      , opt = {duration: 60}

    this.timeout(1000)
    
    function callback(obj) {
      ade(obj, test)
      --len || done()
    }
    aggr(ns, {d: 'd'}, opt, callback)
    setTimeout(function() { aggr(ns, {a: 'a'}, opt, callback) }, 50)
    setTimeout(function() { aggr(ns, {b: 'b'}, opt, callback) }, 40)
    setTimeout(function() { aggr(ns, {c: 'c'}, opt, callback) }, 30)
  })

  it('should work with a debounced duration', function(done) {
    var ns = 'timeouts-2'
      , len = 4
      , opt = {duration: 30, debounce: true}

    this.timeout(1000)
    
    function callback(obj) {
      ade(obj, test)
      --len || done()
    }
    aggr(ns, {d: 'd'}, opt, callback)
    setTimeout(function() { aggr(ns, {a: 'a'}, opt, callback) }, 20)
    setTimeout(function() { aggr(ns, {b: 'b'}, opt, callback) }, 40)
    setTimeout(function() { aggr(ns, {c: 'c'}, opt, callback) }, 60)
  })

  it('should not collide with other namespaces', function(done) {
    var ns = 'multiplies'
      , ns2 = 'strings'
      , len = 4

    function add(a, b) {
      return (a || '') + b
    }
    function multi(a, b) {
      return (a || 0) + (b * b)
    }
    function callback(total) {
      ase(total, 20)
      --len || done()
    }
    function callback2(total) {
      ase(total, 'what')
      --len || done()
    }
    aggr(ns, 2, {iterator: multi}, callback)
    aggr(ns, 4, {iterator: multi}, callback)
    aggr(ns2, 'wh', {iterator: add}, callback2)
    aggr(ns2, 'at', {iterator: add}, callback2)
  })

  it('should only call the callback once', function(done) {
    var ns = 'noop'
      , opt = {noop: true}
    function callback(obj) {
      ade(obj, test)
      done()
    }
    aggr(ns, {a: 'a'}, opt, callback)
    aggr(ns, {d: 'd'}, opt, callback)
    aggr(ns, {b: 'b'}, opt, callback)
    aggr(ns, {c: 'c'}, opt, callback)
  })

  it('should only call the callback once and the extra method for the rest', function(done) {
    var ns = 'extra'
      , opt = {extra: extra}
      , len = 4

    function extra(obj) {
      ade(obj, test)
      --len || done()
    }
    function callback(obj) {
      ade(obj, test)
      ase(len, 4)
      --len || done()
    }
    aggr(ns, {b: 'b'}, opt, callback)
    aggr(ns, {c: 'c'}, opt, callback)
    aggr(ns, {a: 'a'}, opt, callback)
    aggr(ns, {d: 'd'}, opt, callback)
  })

  it('should work with the wrap shortcut', function(done) {
    var fn = aggr.wrap('wrap', function(all) {
      ade(all, {a: 'a', b: 'b', c: 'c'})
      done()
    })
    fn({b: 'b'})
    fn({a: 'a'})
    fn({c: 'c'})
  })

  it('should work with the example queue', function(done) {
    var len = 6
    function callback() {
      ase(store.__data.beau.foo, 20)
      ase(store.__data.beau.bar, 'asdf')
      ase(store.__data.beau.baz, true)
      --len || done()
    }
    function callback2() {
      ase(store.__data.meow.hi, 'there')
      ase(store.__data.meow.hello, 'you')
      ase(store.__data.meow.herp, 'derp')
      --len || done()
    }
    store.update('meow', {hi: 'there'}, callback2)
    store.update('beau', {foo: 20}, callback)
    store.update('meow', {hello: 'you'}, callback2)
    store.update('beau', {bar: 'asdf'}, callback)
    store.update('meow', {herp: 'derp'}, callback2)
    store.update('beau', {baz: true}, callback)
  })

  it('should have conflicts if not using aggregation', function(done) {
    var len = 3
    function callback() {
      --len || done()
    }
    tick(function() {
      store.badUpdate('bad', {a: 1}, function() {
        var bad = store.__data.bad
        ase(bad.a, 1)
        ase(bad.b, undefined)
        ase(bad.c, undefined)
        callback()
      })
    })
    tick(function() {
      store.badUpdate('bad', {b: 2}, function() {
        var bad = store.__data.bad
        ase(bad.a, undefined)
        ase(bad.b, 2)
        ase(bad.c, undefined)
        callback()
      })
    })
    tick(function() {
      store.badUpdate('bad', {c: 3}, function() {
        var bad = store.__data.bad
        ase(bad.a, undefined)
        ase(bad.b, undefined)
        ase(bad.c, 3)
        callback()
      })
    })
  })

  it('should be minified and up to date', function() {
    var min = require('./aggr.min')
    ase(min.VERSION, aggr.VERSION)
  })
})