let chalk = require('chalk')
let fs = require('fs')
let path = require('path')
const CONSTANTS = require('./../Configuration/constants')
const fork = require('child_process').fork
const config = require('./../Configuration/config')

let spawnMicroservice = function (msPath, params) {
  let msProcess = fork(msPath, params.split(' '), {stdio: ['pipe', 'pipe', 'pipe', 'ipc']})
  let stream
  
  msProcess.on('message', (selfConf) => {
    let identifier = selfConf.name + '@' + selfConf.host + ':' + selfConf.port
    let stdio = selfConf.cli.stdio 
    config.addNode(identifier, msProcess, selfConf)

    console.log(chalk.blue(`process ${chalk.bold(identifier)} successfully lunched. writing output to ${stdio} [${msProcess.spawnargs.slice(2).join(' ')}]`))

    if (stdio === CONSTANTS.STDIO.console) {
      msProcess.stdout.on('data', function (data) {
        process.stdout.write(data.toString())
      })

      msProcess.stderr.on('data', function (data) {
        process.stderr.write(data)
      })
    }

    else if (stdio === CONSTANTS.STDIO.file) {
      let dirname = path.dirname(msProcess.spawnargs.slice(1,2)[0])
      if (!fs.existsSync(`${dirname}/log`) ) {
        fs.mkdirSync(`${dirname}/log`)
      }
      console.log(`${dirname}/log/${identifier}.log`)
      stream = fs.createWriteStream(`${dirname}/log/${identifier}.log`, {flags: 'w', autoClose: true })
      msProcess.stdout.pipe(stream)
      msProcess.stderr.pipe(stream)
    }

    msProcess.on(`exit`, function (code) {
      config.removeNode(identifier)
      console.error(chalk.bold.red(`child process for ${identifier} exited with code ${code}`))
    })
  })
}

module.exports = {
  spawnMicroservice: spawnMicroservice
}
