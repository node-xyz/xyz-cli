let chalk = require('chalk')

let nodes = {}
let rc = {}

// single event listener. (aside from the one waiting on `init in fork.js`) // TODO unify them
// note that multiple function of the `config` can call any child process
// using nodes[identifier], though all of the responses should be handled here.
process.on('message', (data) => {
  if (data.title === 'inspect') {
    // whoever calls the inspect of a child process, it should count on this
    // method to print it
    console.log(data.body)
  }
})

module.exports = {
  getNodes: () => Object.keys(nodes),

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
    } else {
      cb('Node not found')
    }
  },

  inspect: function (identifier) {
    if (Object.keys(nodes).indexOf(identifier) === -1) {
      console.log(chalk.bold.red(`node with identifier ${identifier} not found`))
    }
    nodes[identifier].process.send({title: 'inspect'})
  },

  setRc: (aRc) => {
    rc = aRc
  },

  getRc: () => rc
}
