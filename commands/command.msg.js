const chalk = require('chalk')
let config = require('./../Configuration/config')

function msg (args, callback) {
  console.log(args)
  config.msg(args.identifier, args.servicePath, args.payload, (err, data) => {
    if (err) {
      console.log(chalk.bold.red(err))
    } else {
      console.log(chalk.green.bold(`messages successfully sent to ${args.identifier}`))
      console.log(`${chalk.bold.yellow('RESPONSE: ')} ${JSON.stringify(data, null, 2)}`)
    }
    callback()
  })
}

module.exports = msg
