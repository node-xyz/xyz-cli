let chalk = require('chalk')
const CONSTANTS = require('./../Configuration/constants')
let fork = require('./fork')
let util = require('./util')

let single = function (env) {
  let rc
  if (!env.config) {
    console.log(chalk.blue.bold('no config file given. reading from /xyzrc.json'))
    try {
      rc = require(`${process.cwd()}/xyzrc.json`)
    } catch (e) {
      console.log(chalk.red.bold('config file not found. terminating'))
      process.exit()
    }
  } else {
    rc = require(`${process.cwd()}/${env.config}`)
  }

  rc = util.MergeRecursive(CONSTANTS.defaultRcConfig, rc)

  let node = rc.nodes.filter((obj) => {
    if (obj.path == env) return true
    return false
  })
  if (node.length !== 1) {
    console.log(chalk.red.bold(`node with name ${env} was either not found or found multiple times. terminating...`))
    process.exit()
  }
  node = util.MergeRecursive(node[0], CONSTANTS.defaultNodeConfig)

  let port = node.port
  console.log(chalk.yellow(`Spawning 1 instances for ${node.path}`))
  console.log(node.params + ` --xyz-port ${port} -xyz-cli.enable true --xyz-cli.stdio console`)
  fork.spawnMicroservice(node.path, node.params + ` --xyz-port ${port} -xyz-cli.enable true --xyz-cli.stdio console`)
}

module.exports = single
