timestream
=====

[![NPM](https://nodei.co/npm/timestream.png)](https://nodei.co/npm/timestream/)

[![david-dm](https://david-dm.org/brycebaril/timestream.png)](https://david-dm.org/brycebaril/timestream/)
[![david-dm](https://david-dm.org/brycebaril/timestream/dev-status.png)](https://david-dm.org/brycebaril/timestream#info=devDependencies/)

`timestream` is a suite of tools for working with `objectMode` streams of time-ordered records, i.e. timeseries data.

**NOTE: THIS IS A WORK IN PROGRESS**

Consider this to be unstable, check back often for updates.

```javascript
var timestream = require("timestream")

// generate a geometric series:
var s = timestream.gen({start: 0, until: 10000, interval: 1000})

// generate a random series:
var r = timestream.rand({start: 0, until: 10000, interval: 2000})

// sin(x) each record of stream s and union it with series r
s.sin()
 .union(r)
 .toArray(console.log)
```

Usage
===

On its own, this library provides a way to generate either geometrically increasing/decreasing data, or random data. You can also use [stream-spigot](http://npm.im/stream-spigot) to generate records.

The intent of the library is to be used in situations where you are provided an objectMode stream of time-sequential records, such as [level-version](http://npm.im/level-version)

Transforming Data
---

The library provides a wide variety of operations that can be done to timeseries data, from joining it by timestamp to other streams, doing rolling aggregates, performing transforms on each record, or filtering the streams.

See the API for a full list of operations, including some which let you simply provide your own transforms or filters.

All of the transforms and joins return a new Timestream object and are meant to be chained.

Getting Data Out
---

There are currently three provided means for getting data out of the timestream pipeline: `pipe` `tail` and `toArray` -- Although the timestream object isn't actually a stream, it encapsulates a stream that it provides `pipe` access to.

API
===

Endpoints
---

`timestream.pipe(stream [,options])`
---

Pipe the encapsulated stream to a `stream.Transform` or `stream.Writable` stream for downstream processing. This method does *not* return a Timestream and cannot be chained.

`timestream.tail(fn)`
---

Provide a function of the form `fn(record)` that will be called asynchronously as records are completed in the pipeline. This method does *not* return a Timestream and cannot be chained.

`timestream.toArray(fn)`
---

Provide a function that will accept the fully realized transformed record set in a single Array of records. Function should be `fn(recordArray)` and will be called once all input streams have ended and all transformations have occured. If your input streams never end, you may want to avoid using `toArray`.

Generators
===

There are a few ways to generate timestreams via this library.

  * gen
  * rand
  * one

`timestream.gen(options)`
---

Generate a geometric sequence with a single numeric record at each timestamp.

Options:

  * start (required): A millisecond timestamp for the first record
  * until (required): A millsecond timestamp for the maximum possible timestamp in this series
  * interval (required): A number of milliseconds to increment each record's timestamp by
  * key: A name for the value at each record. Default `gen`
  * initial: An initial value for the first record. Default 0
  * increment: How much to increment the value by for each record. Default 1

`timestream.rand(options)`
---

Generate a random series with a `Math.random()` value at each timestamp.

Options:

  * start (required): A millisecond timestamp for the first record
  * until (required): A millsecond timestamp for the maximum possible timestamp in this series
  * interval (required): A number of milliseconds to increment each record's timestamp by
  * key: A name for the value at each record. Default `rand`

`timestream.one(timestamp [,record])`
---

Generate a single record at a single point in time. Default record is {gen: 1}, accepts any type of record.

Joins
===

Join operations combine two timestreams based on the timestamps. All operations are considered **left** side operations, that is when combining records, they will use the left values where matching records have keys that overlap.

**NOTE**: You'll frequently want to do an aggregation operation before joining to make sure the temestamps match.)

  * union
  * join
  * intersect
  * complement
  * diff
  * where

`timestream.union(otherTimestream)`
---

Perform a **left** union operation. Take all records from both sets. Combine overlapping records.

`timestream.join(otherTimestream)`
---

Perform a **left** join operation. Take all records from the left set, combined with any values from matching records in the right set.

`timestream.intersect(otherTimestream)`
---

Perform a **left** intersection. Take only records where both sets have matching timestamps.


`timestream.complement(otherTimestream)`
---

Perform a complement. Of the combined sets take only records that complement the left set, that is records on the right only that have no matching left record.

`timestream.diff(otherTimestream)`
---

Perform a symmetric difference. Keep only records where neither set overlaps the other.

`timestream.where(filterFn, otherTimestream)`
---

Performs a **left** join with a filter function. If your filter returns `true` it will keep the **left** record, otherwise it will skip it. Filter function is `filterFn(leftRecord, rightRecord)` where rightRecord could be null. The record **can** be mutated in your filter function.


Aggregates
===

Aggregation operations combine records of a single timestream based on regular time intervals. They effectively pivot each set of records over the keys and apply the function to each key over all records in a time window.

  * sum
  * count
  * mean
  * mode
  * median
  * percentile
  * variance
  * stdev
  * min
  * max
  * first
  * last
  * sample

All aggregates accept an interval slice that it will partition the streams into. This can either be a raw number, or any of the intervals accepted by [floordate](http://npm.im/floordate):

  * s, sec, secs, second, seconds
  * m, min, mins, minute, minutes
  * h, hr, hrs, hour, hours
  * d, day, days
  * w, wk, wks, week, weeks
  * M, mon, mons, month, months
  * q, qtr, qtrs, quarter, quarters
  * y, yr, yrs, year, years

If no interval is specified, the operation is applied over every record resulting in a single record.

`timestream.sum([interval])`
---

Aggregate each time interval into a single record that is a sum of the records.

`timestream.count([interval])`
---

Aggregate each time interval into a single record that is a count of instances of keys accross the records.

`timestream.mean([interval])`
---

Average (mean) all records into a single record by time interval.

`timestream.mode([interval])`
---

Average (mode) all records into a single record by time interval.

`timestream.median([interval])`
---

Average (median) all records into a single record by time interval.

`timestream.percentile([interval,] percent)`
---

Determine the specified percentile of each record accross the interval into a single record.

`timestream.variance([interval])`
---

Calculate the statstical variance from the mean accross the interval into a single record.

`timestream.stdev([interval])`
---

Determine the standard deviation of each record from the mean of the records in the interval.

`timestream.min([interval])`
---

Aggregate each time interval into a single record that is the minimum value of each key accross the records.

`timestream.max([interval])`
---

Aggregate each time interval into a single record that is the maximum value of each key accross the records.

`timestream.first([interval])`
---

Take the first record in each time window.

`timestream.last([interval])`
---

Take the last record in each time window.

`timestream.sample([interval])`
---

Take a random record from each time window.

Filters
===

Filter a single timeseries keeping only records that satisfy the filter.

  * range
  * rtrim
  * ltrim
  * scrub
  * filter

`timestream.range(start, end)`
---

Keep an (inclusive) time range from the timestream.

`timestream.rtrim(n)`
---

Keep only the latest N records from the **right** side of the timestream, e.g. the last N chronologically.

`timestream.ltrim(n)`
---

Keep only the first N records from the **left** side of the timestream, e.g. the first N chronologically.

`timestream.scrub()`
---

Remove records that are "empty", that is they have no data beyond the timestamp.

`timestream.filter(fn)`
---

Apply a filter function to each record, returning true if it is to be kept. Function should be `fn(record)` and return true to keep the record, or false to discard it.

Operations
===

This set of transform operations operate on each record, and thus will forward the same number of records downstream, unlike the filters or aggregates.

* apply
* ceil
* floor
* round
* abs
* log
* exp
* pow
* sqrt
* sin
* cos
* plus
* minus
* times
* divide
* elapsed
* dt
* cumsum
* sma
* keep
* into
* rename
* numbers
* flatten
* nest
* slide
* map

`apply(fn)`
---

Apply `fn` to each value in each record. Walks through each record calling `fn` for each value, so `fn` should accept a value and return what you would like the new value to be.

`ceil()`
---

Apply `Math.ceil` to each numeric value in each record.

`floor()`
---

Apply `Math.floor` to each numeric value in each record.

`round(factor)`
---

Round each numeric value in each record to the specified factor. E.g. if the factor is `10` it will round to the tens place `333 -> 330`.

`abs()`
---

Apply `Math.abs` to each numeric value in each record.

`log()`
---

Apply `Math.log` to each numeric value in each record.

`exp()`
---

Apply `Math.exp` to each numeric value in each record.

`pow(factor)`
---

Apply `Math.pow(number, factor)` to each numeric value in each record.

`sqrt()`
---

Apply `Math.sqrt` to each numeric value in each record.

`sin()`
---

Apply `Math.sin` to each numeric value in each record.

`cos()`
---

Apply `Math.cos` to each numeric value in each record.

`plus(addend)`
---

Add the value `addend` to each numeric value in each record.

`minus(addend)`
---

Subtract the value `addend` from each numeric value in each record.

`times(factor)`
---

Multiply the value `factor` by each numeric value in each record.

`divide(factor)`
---

Divide each numeric value in each record by the value `factor`.

`elapsed()`
---

Insert a new key `elapsed` in each record, which is the difference in time since the previous record in the timeseries.

`dt()`
---

For each numeric value in each record, replace the value with its difference from the previous value. This can be considered similar to a differential.

`cumsum()`
---

Replace each numeric value with the cumulative sum of all numeric values at that key prior to this record.

`sma(n)`
---

Replace each numeric value with the Simple Moving Average (mean) of that value for the previous `n` records.

`keep(keys)`
---

Keep only the keys specified by the array `keys` in each record.

`into(path [,name])`
---

Replace the record with a new record which is at the key or key path specified by `path` and optionally rename the key to `name`. Use this to convert timeseries with partitioned or nested data into specific portions of each record only. `path` accepts js dot notation, e.g. `into("v", "foo.bar[2]")` would find in each record a property named `foo`, in each of those objects a property named `bar` which stores an array, then from that array take the 3rd element only.

`rename(from, to)`
---

Rename the key `from` to the name `to` at each record.

`numbers()`
---

Remove all non-numeric values from each record.

`flatten()`
---

Flatten the record (using [flatnest](http://npm.im/flatnest)) into a record with no nested structures, preserving content.

E.g.
```
[
  {_t: 0, abc: {def: ["v0", "v0.1"]}, zyx: ["aa", "ab"]},
  {_t: 1, abc: {def: ["v1", "v1.1"]}, zyx: ["ba", "bb"]},
  {_t: 2, abc: {def: ["v2", "v2.1"]}, zyx: ["ca", "cb"]},
  {_t: 3, abc: {def: ["v3", "v3.1"]}, zyx: ["da", "db"]},
  {_t: 4, abc: {def: ["v4", "v4.1"]}, zyx: ["ea", "eb"]},
  {_t: 5, abc: {def: ["v5", "v5.1"]}, zyx: ["fa", "fb"]},
  {_t: 6},
]
```

Becomes:
```
[
  {"_t":0,"abc.def[0]":"v0","abc.def[1]":"v0.1","zyx[0]":"aa","zyx[1]":"ab"},
  {"_t":1,"abc.def[0]":"v1","abc.def[1]":"v1.1","zyx[0]":"ba","zyx[1]":"bb"},
  {"_t":2,"abc.def[0]":"v2","abc.def[1]":"v2.1","zyx[0]":"ca","zyx[1]":"cb"},
  {"_t":3,"abc.def[0]":"v3","abc.def[1]":"v3.1","zyx[0]":"da","zyx[1]":"db"},
  {"_t":4,"abc.def[0]":"v4","abc.def[1]":"v4.1","zyx[0]":"ea","zyx[1]":"eb"},
  {"_t":5,"abc.def[0]":"v5","abc.def[1]":"v5.1","zyx[0]":"fa","zyx[1]":"fb"},
  {"_t":6}
]

```

`nest()`
---

Nest the record (using [flatnest](http://npm.im/flatnest)) into a nested structure based on the key names. Typically used to undo a `flatten()` operation.

`slide(value)`
---

Add `value` to each record's timestamp, effectively sliding it in time.

`map(fn)`
---

Do it yourself! Full control of each record, using [through2-map](http://npm.im/through2-map). Provide a function that accepts a record, and return a new record to send downstream.

LICENSE
=======

MIT
