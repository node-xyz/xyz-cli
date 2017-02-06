let chalk = require('chalk')
let util = require('./../commands/util')

let nodes = {}
let rc = {}
let cliAdmin

module.exports = {

  // will return one of instances in nodes
  // or -1
  // TODO implement this for cleaner code
  _chooseIdentifier (identifier) {

  },

  getNodes: () => nodes,

  addNode: function addNode (identifier, aProcess, aConfig) {
    nodes[identifier] = {
      process: aProcess,
      selfConfig: aConfig
    }
  },

  removeNode: function removeNode (aNode) {
    delete nodes[aNode]
  },

  create: function create (nodePath, params, cb) {
    let fork = require('./../commands/fork')
    fork.spawnMicroservice(nodePath, params, cb)
  },

  duplicate: function duplicate (identifier, cb) {
    const fork = require('./../commands/fork')
    let spawnargs
    if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        cb(`Index out of range`)
        return
      }
      spawnargs = nodes[Object.keys(nodes)[identifier]].process.spawnargs
    } else {
      if (Object.keys(nodes).indexOf(identifier) === -1) {
        cb(`node with identifier ${identifier} not found`)
        return
      }
      spawnargs = nodes[identifier].process.spawnargs
    }
    // args are ready now, but we have to find a new port
    // note that ANY SPAWN ARG will have --xyz-port (what we read from xyzrc.json)
    let port = Number(spawnargs[spawnargs.indexOf('--xyz-port') + 1])
    let checkPort = function (port) {
      util.isPortTaken(port, (err, _takne) => {
        if (_takne) {
          port = port + 1
          checkPort(port)
        } else {
          spawnargs[spawnargs.indexOf('--xyz-port') + 1] = String(port)
          fork.spawnMicroservice(spawnargs[1], spawnargs.slice(2).join(' '))
          cb(null)
        }
      })
    }
    checkPort(port)
  },

  restart: function restart (identifier, cb) {
    let fork = require('./../commands/fork')
    let _spawnArgs, nodePath, params
    if (nodes[identifier]) {
      _spawnArgs = nodes[identifier].process.spawnargs
      params = _spawnArgs.slice(2).join(' ')
      nodePath = _spawnArgs.slice(1, 2)[0]
    } else if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        cb(`Index ${identifier} out of range`)
        return
      } else {
        _spawnArgs = nodes[Object.keys(nodes)[identifier]].process.spawnargs
        params = _spawnArgs.slice(2).join(' ')
        nodePath = _spawnArgs.slice(1, 2)[0]
      }
    } else {
      cb(`Node ${identifier} not found`)
      return
    }
    this.kill(identifier, (err) => {
      if (err) {
        cb(err)
      } else {
        fork.spawnMicroservice(nodePath, params)
        cb(null)
      }
    })
  },

  kill: function kill (identifier, cb) {
    if (nodes[identifier]) {
      nodes[identifier].process.kill('SIGTERM')
      delete nodes[identifier]
      cb(null)
    } else if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        cb(`Index ${identifier} out of range`)
        return
      }
      nodes[Object.keys(nodes)[identifier]].process.kill()
      delete nodes[Object.keys(nodes)[identifier]]
      cb(null)
    } else {
      cb(`Node ${identifier} not found`)
    }
  },

  inspect (identifier, json, cb) {
    let index = false
    if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        cb(`Index ${identifier} out of range`)
        return
      } else {
        index = true
      }
    } else {
      if (Object.keys(nodes).indexOf(identifier) === -1) {
        cb(`node with identifier ${identifier} not founds`)
        return
      }
    }
    identifier = (index ? Object.keys(nodes)[identifier] : identifier)
    nodes[identifier].process.send({title: 'inspect' + (json ? 'JSON' : '')})
    nodes[identifier].process.once('message', (data) => {
      if (data.title === 'inspect' + (json ? 'JSON' : '')) {
        cb(null, data.body)
      }
    })
  },

  network (identifier, cb) {
    let index = false
    if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        cb(`Index ${identifier} out of range`)
        return
      } else {
        index = true
      }
    } else {
      if (Object.keys(nodes).indexOf(identifier) === -1) {
        cb(`node with identifier ${identifier} not founds`)
        return
      }
    }
    identifier = (index ? Object.keys(nodes)[identifier] : identifier)
    nodes[identifier].process.send({title: 'network'})
    nodes[identifier].process.once('message', (data) => {
      if (data.title === 'network') {
        cb(null, data.body)
      }
    })
  },

  clean () {
    console.log(chalk.yellow(`cleaning ${Object.keys(nodes)}`))
    for (let node in nodes) {
      nodes[node].process.kill()
    }
  },

  setRc: (aRc) => {
    rc = aRc
  },

  getRc () { return rc },

  setAdmin (aCLIAdmin) { cliAdmin = aCLIAdmin },
  getAdmin () { return cliAdmin }
}
