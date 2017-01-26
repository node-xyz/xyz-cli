let chalk = require('chalk')
const CONSTANTS = require('./../Configuration/constants')
let fork = require('./fork')
let util = require('./util')
let XYZ = require('xyz-core')
let adminBootstrap = require('./../xyz-core-commands/xyz.admin.bootstrap')
let config = require('./../Configuration/config')

let dev = function (env, options) {
  let rc

  if (env.xyzadmin) {
    let cliAdmin = new XYZ({
      selfConf: {
        logLevel: 'info',
        name: 'xyz-admin',
        port: 9000,
        host: '127.0.0.1'
      },
      systemConf: {
        nodes: []
      }
    })
    cliAdmin.bootstrap(adminBootstrap)
  }

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
  for (let node of rc.nodes) {
    let port = node.port
    node = util.MergeRecursive(CONSTANTS.defaultNodeConfig, node)
    console.log(chalk.yellow(`Spawning ${node.instance} instances for ${node.path}`))
    for (let i = 0; i < node.instance; i++) {
      fork.spawnMicroservice(node.path, node.params + ` --xyz-port ${port} --xyz-cli.enable true --xyz-cli.stdio ${node.stdio}`)
      port += 1
    }
  }
  setTimeout(() => { require('./command.table')() }, 500)
}

module.exports = dev
