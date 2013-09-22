module.exports = Timestream
module.exports.Timestream = Timestream
module.exports.gen = gen
module.exports.rand = rand
module.exports.one = one

// TODO explain plans?

var generators = require("timestream-gen")
var joins = require("stream-joins")
var ops = require("timestream-ops")
var filters = require("timestream-filters")
var aggs = require("timestream-aggregates")

var terminus = require("terminus")

var seqKey = "_t"

function Timestream(stream) {
  if (!(this instanceof Timestream)) return new Timestream(stream)
  this.seqKey = seqKey
  this.stream = stream

  this.on = this.stream.on.bind(this.stream)
}

Timestream.prototype.pipe = function (stream, options) {
  return Timestream(this.stream.pipe(stream, options))
}

Timestream.prototype.tail = function (fn) {
  return this.stream.pipe(terminus.tail({objectMode: true}, fn))
}

Timestream.prototype.toArray = function (fn) {
  return this.stream.pipe(terminus.concat({objectMode: true}, fn))
}

/* JOINS */

Timestream.prototype.union = function (right) {
  return Timestream(joins.union(this.seqKey, this.stream, right))
}

Timestream.prototype.join = function (right) {
  return Timestream(joins.join(this.seqKey, this.stream, right))
}

Timestream.prototype.intersect = function (right) {
  return Timestream(joins.intersect(this.seqKey, this.stream, right))
}

Timestream.prototype.complement = function (right) {
  return Timestream(joins.complement(this.seqKey, this.stream, right))
}

Timestream.prototype.diff = function (right) {
  return Timestream(joins.diff(this.seqKey, this.stream, right))
}

Timestream.prototype.where = function (filter, right) {
  return Timestream(joins.where(this.seqKey, filter, this.stream, right))
}

/* OPS */

Timestream.prototype.apply = function (fn) {
  return Timestream(this.stream.pipe(ops.apply(this.seqKey, fn)))
}

Timestream.prototype.ceil = function () {
  return Timestream(this.stream.pipe(ops.ceil(this.seqKey)))
}

Timestream.prototype.floor = function () {
  return Timestream(this.stream.pipe(ops.floor(this.seqKey)))
}

Timestream.prototype.round = function (precision) {
  return Timestream(this.stream.pipe(ops.round(this.seqKey, precision)))
}

Timestream.prototype.abs = function () {
  return Timestream(this.stream.pipe(ops.abs(this.seqKey)))
}

Timestream.prototype.log = function () {
  return Timestream(this.stream.pipe(ops.log(this.seqKey)))
}

Timestream.prototype.exp = function () {
  return Timestream(this.stream.pipe(ops.exp(this.seqKey)))
}

Timestream.prototype.pow = function (factor) {
  return Timestream(this.stream.pipe(ops.pow(this.seqKey, factor)))
}

Timestream.prototype.sqrt = function () {
  return Timestream(this.stream.pipe(ops.sqrt(this.seqKey)))
}

Timestream.prototype.sin = function () {
  return Timestream(this.stream.pipe(ops.sin(this.seqKey)))
}

Timestream.prototype.cos = function () {
  return Timestream(this.stream.pipe(ops.cos(this.seqKey)))
}

Timestream.prototype.plus = function (addend) {
  return Timestream(this.stream.pipe(ops.plus(this.seqKey, addend)))
}

Timestream.prototype.minus = function (addend) {
  return Timestream(this.stream.pipe(ops.minus(this.seqKey, addend)))
}

Timestream.prototype.times = function (factor) {
  return Timestream(this.stream.pipe(ops.times(this.seqKey, factor)))
}

Timestream.prototype.divide = function (factor) {
  return Timestream(this.stream.pipe(ops.divide(this.seqKey, factor)))
}

Timestream.prototype.elapsed = function () {
  return Timestream(this.stream.pipe(ops.elapsed(this.seqKey)))
}

Timestream.prototype.dt = function () {
  return Timestream(this.stream.pipe(ops.dt(this.seqKey)))
}

Timestream.prototype.cumsum = function () {
  return Timestream(this.stream.pipe(ops.cumsum(this.seqKey)))
}

Timestream.prototype.sma = function (n) {
  return Timestream(this.stream.pipe(ops.sma(this.seqKey, n)))
}

Timestream.prototype.keep = function (keys) {
  return Timestream(this.stream.pipe(ops.keep(this.seqKey, keys)))
}

Timestream.prototype.dt = function () {
  return Timestream(this.stream.pipe(ops.dt(this.seqKey)))
}

Timestream.prototype.into = function (path, name) {
  return Timestream(this.stream.pipe(ops.into(this.seqKey, path, name)))
}

Timestream.prototype.rename = function (from, to) {
  return Timestream(this.stream.pipe(ops.rename(from, to)))
}

Timestream.prototype.numbers = function () {
  return Timestream(this.stream.pipe(ops.numbers(this.seqKey)))
}

Timestream.prototype.flatten = function () {
  return Timestream(this.stream.pipe(ops.flatten()))
}

Timestream.prototype.nest = function () {
  return Timestream(this.stream.pipe(ops.nest()))
}

Timestream.prototype.slide = function (amount) {
  return Timestream(this.stream.pipe(ops.slide(this.seqKey, amount)))
}

Timestream.prototype.map = function (fn) {
  return Timestream(this.stream.pipe(ops.map(fn)))
}

/* FILTERS */

Timestream.prototype.range = function (start, end) {
  return Timestream(this.stream.pipe(filters.range(this.seqKey, start, end)))
}

Timestream.prototype.rtrim = function (n) {
  return Timestream(this.stream.pipe(filters.rtrim(n)))
}

Timestream.prototype.ltrim = function (n) {
  return Timestream(this.stream.pipe(filters.ltrim(n)))
}

Timestream.prototype.scrub = function () {
  return Timestream(this.stream.pipe(filters.scrub()))
}

Timestream.prototype.filter = function (fn) {
  return Timestream(this.stream.pipe(filters.filter(fn)))
}

/* AGGREGATES */

/* GENERATORS */

// gen returns an instance of Timestream
function gen(options) {
  return Timestream(generators.gen(options))
}

function rand(options) {
  return Timestream(generators.rand(options))
}

function one(ts, record) {
  return Timestream(generators.one(ts, record))
}