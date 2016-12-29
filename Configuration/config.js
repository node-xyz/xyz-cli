let nodes = {}

module.exports = {
  getNodes: () => {
    return nodes
  },

  addNode: (aNode, aProcess) => {
    nodes[aNode] = aProcess
  },

  removeNode: (aNode) => {
    delete nodes[aNode]
  },

  kill: (aNode) => {
    nodes[aNode].kill()
    delete nodes[aNode]
  }
}
