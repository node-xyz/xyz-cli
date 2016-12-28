#!/usr/local/bin/node

let XYZ = require('xyz-core')
let adminBootstrap = require('./xyz-core-commands/xyz.admin.bootstrap')
let chalk = require('chalk')
let clear = require('clear')
let CLI = require('clui')
let figlet = require('figlet')
let inquirer = require('inquirer')
let Preferences = require('preferences')
let Spinner = CLI.Spinner
let CONSTANTS = require('./Configuration/constants')
let _ = require('lodash')
let touch = require('touch')
let fs = require('fs')
let program = require('commander')
let util = require('./commands/util')
const spawn = require('child_process').spawn

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

program
  .command('dev')
  .option('-c, --config <conf>', 'run services using the xyz file given')
  .description('run one instace of each ms locally')
  .action(require('./commands/dev.command'))

program.parse(process.argv)
