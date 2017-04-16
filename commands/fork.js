let chalk = require('chalk')
let fs = require('fs')
let path = require('path')
const CONSTANTS = require('./../Configuration/constants')
const fork = require('child_process').fork
const config = require('./../Configuration/config')

let spawnMicroservice = function (nodePath, params, cb, pipErr = false) {
  console.log(nodePath, params)
  let msProcess = fork(nodePath, params.split(' '), {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
  let stream

  function tempStderrOutput (data) {
    process.stdout.write(`${chalk.bold.yellow('[TEMP DEBUG STDERR]')} ${data.toString()}`)
  }

  if (pipErr) {
    msProcess.stderr.on('data', tempStderrOutput)
  }

  msProcess.on('message', function (_cb, data) {
    if (data.title === 'init') {
      // remove temp listener
      msProcess.stderr.removeAllListeners('data', tempStderrOutput)

      let selfConf = data.body
      let identifier = selfConf.name + '@' + selfConf.host + ':' + selfConf.transport[0].port
      let stdio = selfConf.cli.stdio
      if (_cb) { _cb(null, msProcess, identifier) }
      config.addNode(identifier, msProcess, selfConf)

      console.log(chalk.blue(`process ${chalk.bold(identifier)} successfully lunched. writing output to ${stdio} [${msProcess.spawnargs.slice(2).join(' ')}]`))

      if (stdio === CONSTANTS.STDIO.console) {
        msProcess.stdout.on('data', function (data) {
          process.stdout.write(data.toString())
        })

        msProcess.stderr.on('data', function (data) {
          process.stderr.write(data.toString())
        })
      } else if (stdio === CONSTANTS.STDIO.file) {
        let dirname = path.dirname(msProcess.spawnargs.slice(1, 2)[0])
        console.log(chalk.blue(`creating logfile ${dirname}/log/${identifier}.log`))
        if (!fs.existsSync(`${dirname}/log`)) {
          fs.mkdirSync(`${dirname}/log`)
        }

        stream = fs.createWriteStream(`${dirname}/log/${identifier}.log`, {flags: 'w', autoClose: true})
        msProcess.stdout.pipe(stream)
        msProcess.stderr.pipe(stream)
      }

      msProcess.on(`error`, (error) => {
        config.removeNode(identifier)
        console.error(chalk.bold.red(`[ERROR]child process for ${identifier} raised an error ${error.message}`))
      })

      // msProcess.on('uncaughtException', () => {
      //   config.removeNode(identifier)
      //   console.error(chalk.bold.red(`[uncaughtException] child process for ${identifier}`))
      // })
      //
      // msProcess.on('SIGTERM', () => {
      //   config.removeNode(identifier)
      //   console.error(chalk.bold.red(`[SIGTERM] child process for ${identifier}`))
      // })

      msProcess.on(`exit`, (code, signal) => {
        config.removeNode(identifier)
        console.error(chalk.bold.red(`[EXIT]child process for ${identifier} exited with code ${code} signal ${signal}`))
      })
    }
  }.bind(null, cb))
}

module.exports = {
  spawnMicroservice: spawnMicroservice
}
