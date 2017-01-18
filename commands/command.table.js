let config = require('./../Configuration/config')
var marked = require('marked')
var TerminalRenderer = require('marked-terminal')

marked.setOptions({
  renderer: new TerminalRenderer()
})

function table () {
  let table = `| Identifier   |            |   |\n|----------|:-------------:|------:|\n`

  let nodes = config.getNodes()
  for (let node of nodes) {
    table += `|  ${node} |   |   |\n`
  }
  console.log(marked(table))
}

module.exports = table
