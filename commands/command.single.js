const XYZ = require('xyz-core')
const CONSTANTS = require('./../Configuration/constants')
let chalk = require('chalk')
let fork = require('./fork')
let util = require('./util')
let adminBootstrap = require('./../xyz-core-commands/xyz.admin.bootstrap')
let config = require('./../Configuration/config')

let single = function (args, finish) {
  console.log(args)
  let file = args.file
  let params
  if (args.params) {
    params = args.params.map((o, i) => {
      if ((i % 2) === 0) {
        return ('--' + o)
      }
      return o
    }).join(' ')
  }

  let cmdLineArgs
  if (args.xyzCommandLineArgs) {
    cmdLineArgs = util.argArrayToObject(args.xyzCommandLineArgs)
  }

  let rc = CONSTANTS.defaultRcConfig
  let cliAdmin = new XYZ({
    selfConf: rc.selfConf,
    systemConf: rc.systemConf
  }, cmdLineArgs)
  cliAdmin.bootstrap(adminBootstrap)
  config.setAdmin(cliAdmin)

  fork.spawnMicroservice(
    file,
    (params || '') + ` --xyz-cli.enable true --xyz-cli.stdio file --xys-node 127.0.0.1:9000 `, () => {}, true)

  finish()
}

module.exports = single
