let chalk = require('chalk')
let fs = require('fs')
let path = require('path')
const CONSTANTS = require('./../Configuration/constants')
const fork = require('child_process').fork
const config = require('./../Configuration/config')

let spawnMicroservice = function (msPath, params, stdio) {
  let msProcess = fork(msPath, params.split(' ').concat(['--xyz-cli', 'true']), {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
  let stream

  msProcess.on('message', (c) => {
    config.addNode(c, msProcess)

    console.log(chalk.blue(`process ${chalk.bold(c)} successfully lunched. writing output to ${stdio}`))

    if (stdio === CONSTANTS.STDIO.console) {
      msProcess.stdout.on('data', function (data) {
        process.stdout.write(data.toString())
      })

      msProcess.stderr.on('data', function (data) {
        process.stderr.write(data)
      })
    }
    else if (stdio === CONSTANTS.STDIO.file) {
      let dirname = path.dirname(msPath)
      if (!fs.existsSync(`${dirname}/log`) ) {
        fs.mkdirSync(`${dirname}/log`)
      }
      stream = fs.createWriteStream(`${dirname}/log/${c}.log`, {flags: 'a', autoClose: true })
      msProcess.stdout.pipe(stream)
      msProcess.stderr.pipe(stream)
    }
  })

  msProcess.on(`exit`, function (code) {
    config.removeNode(name)
    console.error(chalk.bold.red(`child process for ${msPath} exited with code ${code}`))
  })
}

module.exports = {
  spawnMicroservice: spawnMicroservice
}
