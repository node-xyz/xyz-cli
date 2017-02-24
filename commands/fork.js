let chalk = require('chalk')
let fs = require('fs')
let path = require('path')
const CONSTANTS = require('./../Configuration/constants')
const fork = require('child_process').fork
const config = require('./../Configuration/config')

let spawnMicroservice = function (nodePath, params, cb) {
  let msProcess = fork(nodePath, params.split(' '), {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
  let stream

  function tempErrorOutput (code, signal) {
    console.log(chalk.bold.red(`[EXIT BEFORE LUNCH] process ${msProcess.spawnargs[1]} error: CODE ${code} SIGNAL ${signal}`))
  }

  function tempStdoutOutput (data) {
    // console.log(`${chalk.bold('[BEFORE LUNCH stdout.data]')} ${data.toString()}`)
  }

  function tempStderrOutput (data) {
    // console.log(`${chalk.bold('[BEFORE LUNCH stderr.data]')} ${data.toString()}`)
  }

  // DEBUG ONLY
  // TODO
  // one solution is to uncomment this, do nothing if console is the stdout
  // and unbound them if file is. think it will work
  
  // msProcess.stdout.on('data', tempStdoutOutput)
  // msProcess.stderr.on('data', tempErrorOutput)
  msProcess.on('exit', tempErrorOutput)

  msProcess.on('message', function (_cb, data) {
    if (data.title == 'init') {
      // remove temp listener
      msProcess.removeListener('exit', tempErrorOutput)
      msProcess.stdout.removeAllListeners('data', tempStdoutOutput)
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

        stream = fs.createWriteStream(`${dirname}/log/${identifier}.log`, {flags: 'w', autoClose: true })
        msProcess.stdout.pipe(stream)
        msProcess.stderr.pipe(stream)
      }

      msProcess.on(`error`, (error) => {
        config.removeNode(identifier)
        console.error(chalk.bold.red(`[ERROR]child process for ${identifier} raised an error ${error.message}`))
      })

      msProcess.on('uncaughtException', () => {
        config.removeNode(identifier)
        console.error(chalk.bold.red(`[uncaughtException] child process for ${identifier}`))
      })

      msProcess.on('SIGTERM', () => {
        config.removeNode(identifier)
        console.error(chalk.bold.red(`[SIGTERM] child process for ${identifier}`))
      })

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
