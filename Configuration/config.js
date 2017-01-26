let chalk = require('chalk')

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

  create: function create (nodePath, params) {
    let fork = require('./../commands/fork')
    fork.spawnMicroservice(nodePath, params)
  },

  // TODO not fully implemented
  duplicate: function duplicate (identifier) {
    const fork = require('./../commands/fork')
    let args
    if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        console.log(chalk.bold.red(`Index out of range`))
        return
      }
      args = nodes[Object.keys(nodes)[identifier]].process.spawnargs
    } else {
      if (Object.keys(nodes).indexOf(identifier) === -1) {
        console.log(chalk.bold.red(`node with identifier ${identifier} not found`))
        return
      }
      args = nodes[identifier].process.spawnargs
    }
    console.log(args)
    fork.spawnMicroservice(args[1], args.slice(2).join(' '))
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
    } else {
      cb('Node not found')
    }
  },

  kill: function kill (identifier, cb) {
    if (nodes[identifier]) {
      nodes[identifier].process.kill()
      delete nodes[identifier]
      cb(null)
    } else if (!isNaN(identifier)) {
      nodes[Object.keys(nodes)[identifier]].process.kill
      delete nodes[Object.keys(nodes)[identifier]]
      if (cb) cb(null)
    } else {
      cb('Node not found')
    }
  },

  inspect: function (identifier, json) {
    if (!isNaN(identifier)) {
      if (identifier >= Object.keys(nodes).length) {
        console.log(chalk.bold.red(`Index out of range`))
        return
      }
      nodes[Object.keys(nodes)[identifier]].process.send({title: 'inspect' + (json ? 'JSON' : '')})
    } else {
      if (Object.keys(nodes).indexOf(identifier) === -1) {
        console.log(chalk.bold.red(`node with identifier ${identifier} not found`))
        return
      }
      nodes[identifier].process.send({title: 'inspect' + (json ? 'JSON' : '')})
    }
  },

  setRc: (aRc) => {
    rc = aRc
  },

  getRc: () => rc
}
