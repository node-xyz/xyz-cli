let chalk = require('chalk')
const CONSTANTS = require('./../Configuration/constants')
let fork = require('./fork')
let util = require('./util')

let dev = function (env, options) {
  let rc
  if (! env.config) {
    console.log(chalk.blue.bold('no config file given. reading from /xyzrc.json'))
    try {
      rc = require(`${process.cwd()}/xyzrc.json`)
    } catch (e) {
      console.log(chalk.red.bold('config file not found. terminating'))
      process.exit()
    }
  }else {
    rc = require(`${process.cwd()}/${env.config}`)
  }

  rc = util.MergeRecursive(CONSTANTS.defaultRcConfig, rc)
  for (let node of rc.nodes) {
    let port = node.port
    node = util.MergeRecursive(CONSTANTS.defaultNodeConfig, node)
    console.log(chalk.yellow(`Spawning ${node.instance} instances for ${node.name}`))
    for ( let i = 0; i < node.instance; i++) {
      fork.spawnMicroservice(node.name, node.params + ` --xyz-port ${port}`, node.stdio)
      port += 1
    }
  }
}

module.exports = dev
