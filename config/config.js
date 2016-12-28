let nodes = {}

module.exports = {
  getNodes: () => {
    return nodes
  },

  addNode: (aNode, aProcess) => {
    nodes[aNode] = aProcess
    console.log(Object.keys(nodes))
  },

  removeNode: (aNode) => {
    delete nodes[aNode]
  },

  kill: (aNode) => {
    nodes[aNode].kill()
    delete nodes[aNode]
  }
}
