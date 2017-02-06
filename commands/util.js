const fs = require('fs')

function MergeRecursive (obj1, obj2) {
  for (var p in obj2) {
    try {
      if (obj2[p].constructor == Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p])
      } else {
        obj1[p] = obj2[p]
      }
    } catch (e) {
      obj1[p] = obj2[p]
    }
  }
  return obj1
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
module.exports = {
  argArrayToObject: argArrayToObject,
  MergeRecursive: MergeRecursive,
  isPortTaken: isPortTaken
}
