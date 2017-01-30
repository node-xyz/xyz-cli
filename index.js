#!/usr/local/bin/node

let chalk = require('chalk')
let program = require('commander')
let config = require('./Configuration/config')
let table = require('./commands/command.table')

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

// catches ctrl+c event
process.on('SIGINT', () => {
  console.log(chalk.bold.red(`[SIGINT] CLI Process About to exit.`))
  config.clean()
  process.exit()
})

// catches uncaught exceptions
process.on('uncaughtException', (e, ee) => {
  console.log(chalk.bold.red(`[uncaughtException] CLI Process About to exit.\n ${e}`))
  config.clean()
  process.exit()
})

process.stdout.on('data', (data) => {
  let args = data.toString().split(' ').map((str) => str.trim())

  // example
  // inspect stringMS@127.0.0.1:3000

  if (args[0] == 'inspect' && args[1]) {
    config.inspect(args[1], false)
  } else if (args[0] == 'inspectJSON' && args[1]) {
    config.inspect(args[1], true)
  } else if (args[0] == 'list' || args[0] == 'ls') {
    table()
  } else if (args[0] == 'kill' && args[1]) {
    config.kill(args[1], () => {
      process.stdout.write('$xyz >')
    })
  } else if ((args[0] == 'duplicate' || args[0] == 'dup') && args[1]) {
    config.duplicate(args[1], args.slice(2))
  } else if (!args[0].length) {
    process.stdout.write('$xyz >')
  } else {
    console.log(chalk.bold.red(`command {${args[0]}} not found`))
    process.stdout.write('$xyz >')
  }
})
