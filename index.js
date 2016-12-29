#!/usr/local/bin/node

let XYZ = require('xyz-core')
let adminBootstrap = require('./xyz-core-commands/xyz.admin.bootstrap')
let program = require('commander')

program
  .command('dev')
  .option('-c, --config <conf>', 'xyz config file to use. if not, will use ./xyzrc.json')
  .description('run according to config file locally')
  .action(require('./commands/command.dev'))

program
  .command('single')
  .arguments('<node>', 'name of the microservice to run')
  .option('-c, --config <conf>', 'xyz config file to use. if not, will use ./xyzrc.json')
  .description('run single ms according to config file locally')
  .action(require('./commands/command.single'))

program.parse(process.argv)

let cliAdmin = new XYZ({
  selfConf: {
    name: 'xyz-admin',
    port: 9000,
    host: '127.0.0.1'
  },
  systemConf: {
    nodes: []
  }
})
adminBootstrap(cliAdmin)
