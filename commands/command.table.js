let config = require('./../Configuration/config')
let marked = require('marked')
let TerminalRenderer = require('marked-terminal')
const CONSTANTS = require('./../Configuration/constants')
marked.setOptions({
  renderer: new TerminalRenderer()
})

function table () {
  let table = `| Index   | Identifier   | command line arguments |\n|----------|:-------------:|------:|\n`

  let nodes = config.getNodes()
  let index = 0
  for (let node of Object.keys(nodes)) {
    table += ` | ${index}|  ${node} | ${nodes[node].process.spawnargs.slice(2).join(' ')} | \n`
    index += 1
  }

  let admin = config.getAdmin()
  if (admin) {
    console.log(marked(`### CLI Admin : xyz-core is running at port ${admin.CONFIG.getSelfConf().port}
      > use \`inspectSelf\` to see details
      `))
  }
  console.log(marked(table))
}

module.exports = table
