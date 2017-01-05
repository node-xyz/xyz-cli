let nodes = {}
let rc = {} 

module.exports = {
  getNodes: () => Object.keys(nodes),

  addNode: function addNode(identifier, aProcess, aConfig) {
    nodes[identifier] = {
      process: aProcess,
      selfConfig: aConfig
    }
  },

  create: function create(nodePath, params) {
    let fork = require('./../commands/fork')
    fork.spawnMicroservice(nodePath, params)
  },

  removeNode: function removeNode(aNode) {
    delete nodes[aNode]
  },

  restart: function restart(identifier, cb) {
    if (nodes[identifier]) {
      let fork = require('./../commands/fork')
      let _spawnArgs = nodes[identifier].process.spawnargs
      let params = _spawnArgs.slice(2).join(' ')
      let nodePath = _spawnArgs.slice(1, 2)[0]
      this.kill(identifier, (err) => {
        if ( err ) 
          cb(err)
        else { 
          fork.spawnMicroservice(nodePath, params)
          cb(null)
        }
      })
    }

    else {
      cb("Node not found")
    }

  },

  kill: function kill(identifier, cb) {
    if ( nodes[identifier] ) {
      nodes[identifier].process.kill()
      delete nodes[identifier]
      cb(null)
    }    
    else {
      cb('Node not found')
    }
  }, 

  setRc: (aRc) => {
    rc = aRc 
  }, 
  
  getRc: () => rc 
}
