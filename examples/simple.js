var ts = require("../")

var spy = require("through2-spy")

var L = ts.gen({start: 0, until: 100, interval: 10, key: "g.L"})

var R = ts.gen({start: 20, until: 120, interval: 10, key: "g.R"})

var rand = ts.rand({start: 30, until: 80, interval: 10}).plus(10)

L.union(R)
  .sin()
  .union(rand)
  .nest()
  .range(-100, 100)
 // .mean()
  .toArray(console.log)
