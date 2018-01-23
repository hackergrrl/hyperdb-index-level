var hindex = require('hyperdb-index')

function LevelIndex (hdb, ldb, myProcessFn) {
  if (!(this instanceof LevelIndex)) {
    return new LevelIndex(hdb, ldb, myProcessFn)
  }

  var idx = hindex(hdb, {
    processFn: processFn,
    getVersion: getVersion,
    setVersion: setVersion
  })

  function getVersion (cb) {
    ldb.get('version', function (err, hex) {
      if (err && !err.notFound) cb(err)
      else if (err) cb()
      else cb(null, Buffer.from(hex, 'hex'))
    })
  }

  function setVersion (version, cb) {
    ldb.put('version', version.toString('hex'), cb)
  }

  function processFn (node, next) {
    myProcessFn(node, next)
  }

  return idx
}

module.exports = LevelIndex
