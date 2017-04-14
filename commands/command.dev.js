let chalk = require('chalk')
const CONSTANTS = require('./../Configuration/constants')
let fork = require('./fork')
let util = require('./util')
let XYZ = require('xyz-core')
let test = require('xyz-core/src/Config/config.global')
let adminBootstrap = require('./../xyz-core-commands/xyz.admin.bootstrap')
let config = require('./../Configuration/config')

let dev = function (args, cb) {
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

  let nodeIndex = 0
  let instanceIndex = 0
  let DELAY = env.delay || 500

  function createNext () {
    let node = rc.nodes[nodeIndex]
    // done
    if (!node) {
      cb()
      return
    }

    node = util.MergeRecursive(node, CONSTANTS.defaultNodeConfig)

    let port = (node.port) + (instanceIndex * node.increment)
    fork.spawnMicroservice(
      node.path,
      (node.params || '') + ` ${isNaN(port) ? '' : '--xyz-transport.0.port ' + port} --xyz-cli.enable true --xyz-cli.stdio ${node.stdio} ${env.xyzadmin && env.appendadmin ? '--xys-node 127.0.0.1:9000' : ''}`, () => {}, env.errlog)

    instanceIndex++
    if (instanceIndex >= node.instance) {
      instanceIndex = 0
      nodeIndex++
    }

    setTimeout(createNext, DELAY)
  }

  createNext()
}

module.exports = dev
