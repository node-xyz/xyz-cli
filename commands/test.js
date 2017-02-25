let chalk = require('chalk')
const CONSTANTS = require('./../Configuration/constants')
let fork = require('./fork')
let util = require('./util')
let XYZ = require('xyz-core')

let tester
exports.setUpTestEnv = function (cb) {
  try {
    rc = require(`${process.cwd()}/xyztestrc.json`)
  } catch (e) {
    console.log(chalk.red.bold('config file not found. terminating'))
    process.exit()
  }

  rc = util.MergeRecursive(CONSTANTS.defaultRcConfig, rc)
  rc.selfConf.name = 'xyz-tester'
  // rc.selfConf.logLevel = 'none'

  if (!tester) {
    tester = new XYZ({
      selfConf: rc.selfConf,
      systemConf: rc.systemConf
    })
    tester.bootstrap(require('./../xyz-core-commands/xyz.admin.bootstrap'))
  }

  let processes = {}

  let created = 0
  let total = 0
  for (let node of rc.nodes) {
    total += node.instance
  }
  for (let node of rc.nodes) {
    let port = node.port
    node = util.MergeRecursive(CONSTANTS.defaultNodeConfig, node)
    for (let i = 0; i < node.instance; i++) {
      fork.spawnMicroservice(
        node.path,
        node.params + ` --xyz-transport.0.port ${port} --xyz-cli.enable true --xyz-cli.stdio ${node.stdio} --xys-node 127.0.0.1:9000`,
        function (err, msProcess, identifier) {
          processes[identifier] = msProcess
          created += 1
          if (created === total) cb(processes)
        }, true)
      port += 1
    }
  }
}

exports.getTester = function () {
  return tester
}

exports.sendMessage = function (msg, _process, callback) {
  _process.once('message', (data) => {
    if (data.title === msg) {
      callback(data.body)
    }
  })
  _process.send({title: msg})
}
