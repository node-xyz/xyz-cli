let config = require('./../Configuration/config')
var marked = require('marked')
var TerminalRenderer = require('marked-terminal')

marked.setOptions({
  renderer: new TerminalRenderer()
})

function table () {
  let table = `| Index   | Identifier   |  STDIO  | arguments  |\n|----------|:-------------:|------:|\n`

  let nodes = config.getNodes()
  let index = 0
  for (let node of Object.keys(nodes)) {
    table += ` | ${index}|  ${node} |  ${nodes[node].selfConfig.cli.stdio} | ${nodes[node].process.spawnargs.slice(2).join(' ')} |\n`
    index += 1
  }
  console.log(marked(table))
}

module.exports = table
