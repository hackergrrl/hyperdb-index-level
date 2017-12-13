var test = require('tape')
var LevelIndex = require('..')
var hyper = require('hyperdb')
var ram = require('random-access-memory')
var memdb = require('memdb')
var sub = require('subleveldown')

test('basic', function (t) {
  var db = hyper(ram, { valueEncoding: 'json' })
  var lvl = memdb()

  LevelIndex(db, sub(lvl, 'stuff'), processor)

  t.plan(3)

  function processor (node, next) {
    t.equals(node.key, '/foo')
    t.deepEquals(node.value, 'bar')
    next()
  }

  db.put('/foo', 'bar', function (err) {
    t.ifError(err)
  })
})

test('only process latest', function (t) {
  var db = hyper(ram, { valueEncoding: 'json' })
  var lvl = memdb()

  LevelIndex(db, sub(lvl, 'stuff'), processor)

  t.plan(6)

  var n = 0

  function processor (node, next) {
    if (n === 0) {
      t.equals(node.key, '/foo')
      t.deepEquals(node.value, 'bar')
    } else {
      t.equals(node.key, '/foo')
      t.deepEquals(node.value, 'quux')
    }
    n++
    next()
  }

  db.put('/foo', 'bar', function (err) {
    t.ifError(err)
    db.put('/foo', 'quux', function (err) {
      t.ifError(err)
    })
  })
})

test('adder', function (t) {
  var db = hyper(ram, { valueEncoding: 'json' })
  var lvl = memdb()
  var slvl = sub(lvl, 'stuff')
  var idx = LevelIndex(db, slvl, processor)

  t.plan(5)

  function processor (node, next) {
    slvl.get('sum', function (err, sum) {
      if (err && !err.notFound) return next(err)
      else if (err) sum = 0
      else sum = Number(sum)

      sum += node.value
      slvl.put('sum', Number(sum), next)
    })
  }

  idx.sum = function (cb) {
    this.ready(function () {
      slvl.get('sum', function (err, sum) {
        cb(err, sum ? Number(sum) : undefined)
      })
    })
  }

  db.put('/numbers/0', 15, function (err) {
    t.ifError(err)
    db.put('/numbers/1', 2, function (err) {
      t.ifError(err)
      db.put('/numbers/2', 8, function (err) {
        t.ifError(err)
        idx.sum(function (err, sum) {
          t.ifError(err)
          t.equals(sum, 25)
        })
      })
    })
  })
})
