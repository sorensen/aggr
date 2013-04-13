'use strict';

/*!
 * Module dependencies.
 */

var aggr = require('./index')
  , tick = process.nextTick

/**
 * Memory store constructor
 */

function MemoryStore() {
  this.__data = {}
  this.__queue = {}
}

/**
 * Merge two objects together
 *
 * @param {Object} data
 * @return {Object} merged data
 */

MemoryStore.prototype.merge = function(obj, source) {
  for (var prop in source) obj[prop] = source[prop]
  return obj
}

/**
 * Simulate an asynchronous load operation
 *
 * @param {String} key
 * @param {Function} callback
 */

MemoryStore.prototype.load = function(key, next) {
  var self = this
  tick(function() {
    next(null, self.__data[key])
  })
}

/**
 * Simulate an asynchronous save operation
 *
 * @param {String} key
 * @param {Object} data
 * @param {Function} callback
 */

MemoryStore.prototype.save = function(key, val, next) {
  var self = this
  tick(function() {
    self.__data[key] = val
    next(null)
  })
}

/**
 * Add a function to the queue stack
 *
 * @param {String} key
 * @param {Function} callback
 */

MemoryStore.prototype.queue = function(key, next) {
  this.__queue[key] = this.__queue[key] || []
  this.__queue[key].push(next)
}

/**
 * Clear the function queue by executing them all in a FIFO order
 *
 * @param {String} key
 * @param {Error} standard error
 * @param {Object} data
 */

MemoryStore.prototype.doQueue = function(key, err, resp) {
  while (this.__queue[key].length) {
    this.__queue[key].shift()(err, resp)
  }
}

/**
 * Simulate an asynchronous update operation, this will be the main 
 * proof case function, load the old data, merge in the new data, and 
 * then save. We will use the aggregation method here to ensure that 
 * what gets saved is an aggregate of all data.
 *
 * @param {String} key
 * @param {Object} data
 * @param {Function} callback
 */

MemoryStore.prototype.update = function(key, val, next) {
  var self = this
  this.queue(key, next)
  aggr(key, val, {noop: true}, function(all) {
    self.load(key, function(err, resp) {
      val = self.merge(resp || {}, all)
      self.save(key, val, function(err, resp) {
        self.doQueue(key, err, resp)
      })
    })
  })
}

/**
 * An example of what would happen without using aggregation
 *
 * @param {String} key
 * @param {Object} data
 * @param {Function} callback
 */

MemoryStore.prototype.badUpdate = function(key, val, next) {
  var self = this
  this.load(key, function(err, resp) {
    val = self.merge(resp || {}, val)
    self.save(key, val, next)
  })
}

/*!
 * Module exports.
 */

module.exports = MemoryStore
