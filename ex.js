var hindex = require('.')
var hyper = require('hyperdb')
var level = require('level')
var ram = require('random-access-memory')

var db = hyper(ram, { valueEncoding: 'json' })
var lvl = level('./index')
var idx = hindex(db, lvl, processor)

function processor (lvl, kv, oldKv, next) {
  lvl.get('sum', function (err, sum) {
    if (err && !err.notFound) return next(err)
    else if (err) sum = 0
    else sum = Number(sum)

    console.log('sum so far', sum, kv.value)
    sum += kv.value[0]
    lvl.put('sum', Number(sum), next)
  })
}

var getSum = function (cb) {
  idx.ready(function () {
    lvl.get('sum', function (err, sum) {
      cb(err, sum ? Number(sum) : undefined)
    })
  })
}

db.put('/numbers/0', 15, function (err) {
  db.put('/numbers/1', 2, function (err) {
    db.put('/numbers/2', 8, function (err) {
      getSum(function (err, sum) {
        console.log('the sum is', sum)
      })
    })
  })
})

