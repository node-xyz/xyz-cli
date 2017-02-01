let chalk = require('chalk')
let util = require('./../commands/util')

let nodes = {}
let rc = {}

module.exports = {

  getNodes: () => nodes,

  addNode: function addNode (identifier, aProcess, aConfig) {
    nodes[identifier] = {
      process: aProcess,
      selfConfig: aConfig
    }
  },

  create: function create (nodePath, params, cb) {
    let fork = require('./../commands/fork')
    fork.spawnMicroservice(nodePath, params, cb)
  },

  duplicate: function duplicate (identifier) {
    const fork = require('./../commands/fork')
    let spawnargs
    if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        console.log(chalk.bold.red(`Index out of range`))
        return
      }
      spawnargs = nodes[Object.keys(nodes)[identifier]].process.spawnargs
    } else {
      if (Object.keys(nodes).indexOf(identifier) === -1) {
        console.log(chalk.bold.red(`node with identifier ${identifier} not found`))
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
        }
      })
    }

    checkPort(port)
  },

  removeNode: function removeNode (aNode) {
    delete nodes[aNode]
  },

  restart: function restart (identifier, cb) {
    if (nodes[identifier]) {
      let fork = require('./../commands/fork')
      let _spawnArgs = nodes[identifier].process.spawnargs
      let params = _spawnArgs.slice(2).join(' ')
      let nodePath = _spawnArgs.slice(1, 2)[0]
      this.kill(identifier, (err) => {
        if (err) {
          cb(err)
        } else {
          fork.spawnMicroservice(nodePath, params)
          cb(null)
        }
      })
    } else if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        cb(`Index ${identifier} out of range`)
      } else {
        let fork = require('./../commands/fork')
        let _spawnArgs = nodes[Object.keys(nodes)[identifier]].process.spawnargs
        let params = _spawnArgs.slice(2).join(' ')
        let nodePath = _spawnArgs.slice(1, 2)[0]
        this.kill(identifier, (err) => {
          if (err) {
            cb(err)
          } else {
            fork.spawnMicroservice(nodePath, params)
            cb(null)
          }
        })
      }
    } else {
      cb('Node not found')
    }
  },

  kill: function kill (identifier, cb) {
    if (nodes[identifier]) {
      nodes[identifier].process.kill('SIGTERM')
      delete nodes[identifier]
      cb(null)
    } else if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        console.log(chalk.bold.red(`Index out of range`))
        cb('out of range')
      }
      nodes[Object.keys(nodes)[identifier]].process.kill()
      delete nodes[Object.keys(nodes)[identifier]]
      if (cb) cb(null)
    } else {
      cb('Node not found')
    }
  },

  inspect (identifier, json, cb) {
    let err
    if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        err = `Index out of range`
        console.log(chalk.bold.red(err))
        if (cb) { cb(err) }
      } else {
        nodes[Object.keys(nodes)[identifier]].process.send({title: 'inspect' + (json ? 'JSON' : '')})
        if (cb) { cb(null) }
      }
    } else {
      if (Object.keys(nodes).indexOf(identifier) === -1) {
        err = `node with identifier ${identifier} not found`
        console.log(chalk.bold.red(err))
        if (cb) { cb(err) }
      } else {
        nodes[identifier].process.send({title: 'inspect' + (json ? 'JSON' : '')})
        if (cb) { cb(null) }
      }
    }
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

  getRc: () => rc
}
