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
    ldb.get('version', function (err, json) {
      if (err && !err.notFound) cb(err)
      else if (err) cb()
      else cb(null, JSON.parse(json))
    })
  }

  function setVersion (version, cb) {
    var json = JSON.stringify(version)
    ldb.put('version', json, cb)
  }

  function processFn (node, next) {
    myProcessFn(node, next)
  }

  return idx
}

module.exports = LevelIndex
