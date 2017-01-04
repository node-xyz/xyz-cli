#!/usr/local/bin/node
let program = require('commander')

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
