let chalk = require('chalk')
let util = require('./util')
const CONSTANTS = require('./../Configuration/constants')
const spawn = require('child_process').spawn

let spawnMicroservice = function (name, params) {
  let msProcess = spawn('node', [name].concat(params.split(' ')))
  msProcess.stdout.on('data', function (data) { // register one or more handlers
    process.stdout.write(data.toString())
  })

  msProcess.stderr.on('data', function (data) {
    process.stdout.write(data)
  })

  msProcess.on(`exit`, function (code) {
    console.log(`child process for ${name} exited with code` + code)
  })
}

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
    console.log(chalk.yellow.bold(`Swapning ${node.instance} instances for ${node.name}`))
    for ( let i = 0; i < node.instance; i++) {
      spawnMicroservice(node.name, node.params + ` --xyz-port ${port}`)
      port += 1
    }
  }
}

module.exports = dev
