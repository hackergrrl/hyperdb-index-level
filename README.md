# hyperdb-index-level

> A [hyperdb-index][hyperdb-index] backed by LevelDB.

Convenience module for [hyperdb][hyperdb] that wraps up
[hyperdb-index][hyperdb-index] with a LevelDB backend.

## Usage

```js
var hindex = require('hyperdb-index-level')
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
```

outputs

```
sum so far 0 [ 8 ]
sum so far 8 [ 2 ]
sum so far 10 [ 15 ]
the sum is 25
```

## API

```js
var hindex = require('hyperdb-index-level')
```

### var idx = hindex(db, lvl, processorFn)

Creates a new indexer on the hyperdb instance `db`.

The Level instance `lvl` is used for storage. 

`processorFn` is called on the latest value of key that gets set, with the
function signature `processorFn(lvl, kv, oldKv, next)`. `lvl` is the LevelDB
instance you passed into `hindex()`, and the other parameters are the same as
the processor function from
[hyperdb-index](https://github.com/noffle/hyperdb-index#var-idx--indexdb-opts).

### idx.ready(cb)

Registers the callback `cb` to fire when the indexes have "caught up" to the
latest known change in the hyperdb. The `cb` function fires exactly once. You
may call `idx.ready()` multiple times with different functions.

## Tips

If you want to store multiple indexes in one LevelDB, you can partition it with
[subleveldown](https://github.com/mafintosh/subleveldown) so that the indexes
can't affect each other.


## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install hyperdb-index-level
```

## Acknowledgments

hyperdb-index-level was inspired by..

## See Also

- [`noffle/common-readme`](https://github.com/noffle/common-readme)
- ...

## License

ISC

[hyperdb-index]: https://github.com/noffle/hyperdb-index
[hyperdb]: https://github.com/mafintosh/hyperdb
