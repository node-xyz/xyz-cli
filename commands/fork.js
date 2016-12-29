let chalk = require('chalk')
let fs = require('fs')
const CONSTANTS = require('./../Configuration/constants')
const fork = require('child_process').fork
const config = require('./../Configuration/config')

let spawnMicroservice = function (name, params, stdio) {
  let msProcess = fork(name, params.split(' ').concat(['--xyz-cli', 'true']), {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
  let stream

  msProcess.on('message', (c) => {
    config.addNode(c, msProcess)

    console.log(chalk.blue(`process ${chalk.bold(c)} successfully lunched. writing output to ${stdio}`))
    console.log('########################################################')

    if (stdio === CONSTANTS.STDIO.console) {
      msProcess.stdout.on('data', function (data) {
        process.stdout.write(data.toString())
      })

      msProcess.stderr.on('data', function (data) {
        process.stdout.write(data)
      })
    }
    else if (stdio === CONSTANTS.STDIO.file) {
      stream = fs.createWriteStream(`./${name}.log`, {flags: 'a', autoClose: true })
      msProcess.stdout.pipe(stream)
      msProcess.stderr.pipe(stream)
    }
  })

  msProcess.on(`exit`, function (code) {
    config.removeNode(name)
    console.error(chalk.bold.red(`child process for ${name} exited with code ${code}`))
  })
}

module.exports = {
  spawnMicroservice: spawnMicroservice
}
