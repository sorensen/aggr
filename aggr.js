/**
 * (c) 2013 Beau Sorensen
 * MIT Licensed
 * For all details and documentation:
 * https://github.com/sorensen/aggr.js
 */

;(function() {
'use strict';

/*!
 * Module dependencies.
 */

var queue = {} // Data storage queue
  , backs = {} // Callback stacks
  , ticks = {} // Current timeouts
  , toString = Object.prototype.toString
  , noop = function() {}

/**
 * Recursive extend for overriding nested properties, default iterator
 * for main aggregation function, as object values are assumed to be used
 *
 * @param {Object} Destination
 * @param {Object} Source
 * @api private
 */

function extend(obj, source) {
  obj = obj || {}
  if (!source) return obj
  for (var prop in source) obj[prop] = source[prop]
  return obj
}

/**
 * Build an aggregate object
 *
 * @param {String} key namespace
 * @param {Object} obj
 * @param {Object} options (optional)
 * @param {Function} callback
 * @api public
 */

function aggr(ns, obj, options, next) {
  // Check for optional arguments
  if (toString.call(options) === '[object Function]') {
    next = options
    options = {}
  }
  // Ensure default options are set, then determine if an `extra`
  // function has been passed in or if it should be a `noop` call
  var defaults = extend({}, aggr.defaults)
    , opt = extend(defaults, options || {})
    , extra = opt.extra && toString.call(opt.extra === '[object Function]')
      ? opt.extra : opt.noop ? noop : false
    , iterator = opt.iterator
    , ticker = opt.duration || typeof exports === 'undefined' 
      ? setTimeout : process.nextTick
    , resp
  
  // Ensure default queue and callback containers for temporary
  // data storage, add the given object into the queue
  queue[ns] = queue[ns] || []
  backs[ns] = backs[ns] || []
  queue[ns].push(obj)

  // The first method call contains the primary callback, all 
  // callbacks beyond the first are considered extra and are 
  // dealt with per user options, default is to treat like first
  if (queue[ns].length > 1) backs[ns].push(extra || next)
  else backs[ns].push(next)
  
  // Catch all syncronous calls to this function, only the very 
  // first call will start the `tick` event, every call afterwards 
  // will only populate the function stack and data queue. If a 
  // duration has been supplied, however, timeouts will be used, 
  // only a single timeout will be ran unless a `debounce` option
  // is used, in which case we will reset the timeout.
  if (queue[ns].length > 1 && !opt.debounce) return
  ticks[ns] && clearTimeout(ticks[ns])
  ticks[ns] = ticker(function() {
    while (queue[ns].length) resp = iterator(resp, queue[ns].shift())
    while (backs[ns].length) backs[ns].shift()(resp)
    
    // Cleanup empty keys
    delete queue[ns]
    delete backs[ns]
    delete ticks[ns]
  }, opt.duration)
}

/**
 * Wrapping shortcut for aggregate method
 *
 * @param {String} namespace
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

aggr.wrap = function(ns, options, next) {
  // Check for optional arguments
  if (toString.call(options) === '[object Function]') {
    next = options
    options = {}
  }
  if (typeof options.noop === 'undefined') {
    options.noop = true
  }
  return function(obj) {
    aggr(ns, obj, options, next)
  }
}

/*!
 * Exposed default options
 */

aggr.defaults = {
  noop: false
, extra: false
, iterator: extend
, duration: 0
, debounce: false
}

/*!
 * Current library version, should match `package.json`
 */

aggr.VERSION = '0.0.2'

/*!
 * Module exports.
 */

if (typeof exports !== 'undefined') {
  module.exports = aggr
} else {
  this.aggr = aggr
}

}).call(this);
