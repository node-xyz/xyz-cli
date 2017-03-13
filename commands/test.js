let chalk = require('chalk')
const CONSTANTS = require('./../Configuration/constants')
let fork = require('./fork')
let util = require('./util')
let XYZ = require('xyz-core')

let tester
const DELAY = 500
exports.setUpTestEnv = function (cb, rcFile = 'xyztestrc.json') {
  try {
    rc = require(`${process.cwd()}/${rcFile}`)
  } catch (e) {
    console.log(chalk.red.bold(`config file [${process.cwd()}/${rcFile}] not found. terminating`))
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
  } else {
    // this will wonly work with xyz-core 0.3.3 or higer
    tester.serviceRepository.forget()
  }

  let processes = {}

  let created = 0
  let total = 0
  for (let node of rc.nodes) {
    total += node.instance
  }

  let nodeIndex = 0
  let instanceIndex = 0
  const DELAY = 500

  function createNext () {
    let node = rc.nodes[nodeIndex]
    if (!node) {
      cb(processes)
      return
    }
    node = util.MergeRecursive(CONSTANTS.defaultNodeConfig, node)
    // done
    let port = (node.port) + (instanceIndex * node.increment)
    fork.spawnMicroservice(
      node.path,
      node.params + ` --xyz-transport.0.port ${port} --xyz-cli.enable true --xyz-cli.stdio ${node.stdio} --xys-node 127.0.0.1:9000`,
      function (err, msProcess, identifier) {
        processes[identifier] = msProcess
      }, true)

    instanceIndex++
    if (instanceIndex >= node.instance) {
      instanceIndex = 0
      nodeIndex++
    }
    setTimeout(createNext, DELAY)
  }

  createNext()
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
