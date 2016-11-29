const fs = require('fs')

function isXYZDirectory () {
  try {
    fs.accessSync(`${process.cwd()}/xyz.json`, fs.F_OK)
    return true
  } catch (err) {
    return false
  }
}

function doesMsExist (name) {
  try {
    fs.accessSync(`${process.cwd()}/${name}/${name}.json`)
    return true
  } catch (err) {
    return false
  }
}

function MergeRecursive (obj1, obj2) {
  for (var p in obj2) {
    try {
      if (obj2[p].constructor == Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p])
      } else {
        obj1[p] = obj2[p]
      }
    } catch(e) {
      obj1[p] = obj2[p]
    }
  }
  return obj1
}

module.exports = {
  MergeRecursive: MergeRecursive,
  isXYZDirectory: isXYZDirectory,
  doesMsExist: doesMsExist
}
