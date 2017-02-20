let chalk = require('chalk')
const CONSTANTS = require('./../Configuration/constants')
let fork = require('./fork')
let util = require('./util')
let XYZ = require('xyz-core')
let test = require('xyz-core/src/Config/config.global')
let adminBootstrap = require('./../xyz-core-commands/xyz.admin.bootstrap')
let config = require('./../Configuration/config')

let dev = function (args) {
  let rc
  let env = args.options
  if (!env.config) {
    console.log(chalk.blue.bold('no config file given. reading from ./xyzrc.json'))
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

  if (env.xyzadmin) {
    let cmdLineArgs
    if (args.xyzCommandLineArgs) {
      cmdLineArgs = util.argArrayToObject(args.xyzCommandLineArgs)
    }

    let cliAdmin = new XYZ({
      selfConf: rc.selfConf,
      systemConf: rc.systemConf
    }, cmdLineArgs)
    cliAdmin.bootstrap(adminBootstrap)
    config.setAdmin(cliAdmin)
  }

  for (let node of rc.nodes) {
    let port = node.port
    node = util.MergeRecursive(CONSTANTS.defaultNodeConfig, node)
    console.log(chalk.yellow(`Spawning ${node.instance} instances for ${node.path}`))
    for (let i = 0; i < node.instance; i++) {
      fork.spawnMicroservice(node.path, node.params + ` --xyz-transport.0.port ${port} --xyz-cli.enable true --xyz-cli.stdio ${node.stdio}`)
      port += 1
    }
  }
}

module.exports = dev
