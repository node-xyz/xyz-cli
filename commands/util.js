const fs = require('fs')

function MergeRecursive (obj1, obj2) {
  let _obj1 = JSON.parse(JSON.stringify(obj1))
  for (var p in obj2) {
    try {
      if (obj2[p].constructor == Object) {
        _obj1[p] = MergeRecursive(_obj1[p], obj2[p])
      } else {
        _obj1[p] = obj2[p]
      }
    } catch (e) {
      _obj1[p] = obj2[p]
    }
  }
  return _obj1
}

function isPortTaken (port, fn) {
  var net = require('net')
  var tester = net.createServer()
  .once('error', function (err) {
    if (err.code != 'EADDRINUSE') return fn(err)
    fn(null, true)
  })
  .once('listening', function () {
    tester.once('close', function () { fn(null, false) })
    .close()
  })
  .listen(port)
}

function argArrayToObject (arr) {
  let obj = {}
  for (let i = 0; i < arr.length; i++) {
    obj[arr[i].slice(4)] = arr[i + 1]
    i += 1
  }
  return obj
}

function stringToObject (str) {
  let obj = {}
  if (!str) return {}
  let arr = str.split(' ')
  for (let i = 0; i < arr.length; i++) {
    let key = arr[i]
    let value = arr[i + 1]
    obj[key] = value
    i++
  }
  return obj
}
module.exports = {
  argArrayToObject: argArrayToObject,
  MergeRecursive: MergeRecursive,
  isPortTaken: isPortTaken,
  stringToObject: stringToObject
}
