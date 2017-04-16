let chalk = require('chalk')
let util = require('./../commands/util')
let sendToTarget = require('xyz-core/src/Service/Middleware/service.sent.to.target')

let nodes = {}
let rc = {}
let cliAdmin

module.exports = {

  // will return one of instances in nodes
  // or false
  chooseIdentifier (identifier, returnIdentifier = false) {
    if (nodes[identifier]) {
      return returnIdentifier ? identifier : nodes[identifier]
    } else if (!isNaN(identifier)) {
      if (identifier < Object.keys(nodes).length) {
        return returnIdentifier ? Object.keys(nodes)[identifier] : nodes[Object.keys(nodes)[identifier]]
      } else {
        return false
      }
    }
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
    let node = this.chooseIdentifier(identifier)
    if (!node) { cb(`invalid identifier ${identifier}`); return }
    spawnargs = node.process.spawnargs

    // args are ready now, but we have to find a new port
    // note that ANY SPAWN ARG will have --xyz-port (what we read from xyzrc.json)
    let port = Number(spawnargs[spawnargs.indexOf('--xyz-transport.0.port') + 1])
    let checkPort = function (port) {
      util.isPortTaken(port, (err, _takne) => {
        if (_takne) {
          port = port + 1
          checkPort(port)
        } else {
          spawnargs[spawnargs.indexOf('--xyz-transport.0.port') + 1] = String(port)
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

    let node = this.chooseIdentifier(identifier)
    if (!node) { cb(`invalid identifier ${identifier}`); return }
    spawnargs = node.process.spawnargs
    params = spawnargs.slice(2).join(' ')
    nodePath = spawnargs.slice(1, 2)[0]

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
    let nodeIdentifier = this.chooseIdentifier(identifier, true)
    if (!nodeIdentifier) { cb(`invalid identifier ${identifier}`); return }
    nodes[nodeIdentifier].process.kill('SIGTERM')
    delete nodes[nodeIdentifier]
    cb(null)
  },

  msg (identifier, servicePath, payload, cb) {
    let node = this.chooseIdentifier(identifier, true)
    console.log(node)
    if (!node) {
      cb(`invalid identifier ${identifier}`)
      return
    } else if (!cliAdmin) {
      cb(`CLI Admin is not running. try using this command after 'dev -x'`)
      return
    }

    // fix the payload
    try {
      payload = eval(payload)
    } catch (e) {
      try {
        payload = JSON.parse(payload)
      } catch (e) {
        try {
          payload = Object(payload)
        } catch (e) {
          cb(`payload ${payload} could not be understood. ${e}`)
        }
      }
    }

    cliAdmin.call({
      servicePath: servicePath,
      payload: payload || null,
      sendStrategy: sendToTarget(node.split('@')[1])
    }, (err, data) => {
      if (err) {
        cb(err)
      } else {
        cb(null, data)
      }
    })
  },

  inspect (identifier, json, cb) {
    let node = this.chooseIdentifier(identifier)
    if (!node) { cb(`invalid identifier ${identifier}`); return }

    node.process.send({title: 'inspect' + (json ? 'JSON' : '')})
    node.process.once('message', (data) => {
      if (data.title === 'inspect' + (json ? 'JSON' : '')) {
        cb(null, data.body)
      }
    })
  },

  network (identifier, cb) {
    let node = this.chooseIdentifier(identifier)
    if (!node) { cb(`invalid identifier ${identifier}`); return }

    node.process.send({title: 'network'})
    node.process.once('message', (data) => {
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
