#!/usr/local/bin/node

let chalk = require('chalk')
let program = require('commander')
let config = require('./Configuration/config')

program
  .command('dev')
  .option('-c, --config <conf>', 'xyz config file to use. if not, will use ./xyzrc.json')
  .option('-x, --xyzadmin', 'lunch an xyz core instance inside the cli process')
  .description('run according to config file locally')
  .action(require('./commands/command.dev'))

program
  .command('single')
  .arguments('<node>', 'name of the microservice to run')
  .option('-c, --config <conf>', 'xyz config file to use. if not, will use ./xyzrc.json')
  .description('run single ms according to config file locally')
  .action(require('./commands/command.single'))

program.parse(process.argv)

process.stdout.on('data', (data) => {
  let args = data.toString().split(' ').map((str) => str.trim())

  // example
  // inspect stringMS@127.0.0.1:3000

  if (args[0] == 'inspect' && args[1]) {
    config.inspect(args[1])
  } else {
    console.log(chalk.bold.red(`command {${args[0]}} not found`))
  }
})
