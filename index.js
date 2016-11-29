#!/usr/local/bin/node

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

program
  .command('init')
  .description('create new node xyz system')
  .action(name => {
    if (util.isXYZDirectory()) {
      console.log(
        chalk.red('XYZ system already exists.')
      )
      process.exit()
    } else {
      fs.writeFileSync(`${process.cwd()}/xyz.json`,
        `{"microservices": []}`
      )
    }
  })

program
  .command('ms <name>')
  .description('create a new xyz microservice module')
  .action(name => {
    if (util.isXYZDirectory()) {
      if (util.doesMsExist(name)) {
        console.log(chalk.red('Microservice with this name already exists'))
        process.exit()
      } else {
        let questions = [
          {
            type: 'input',
            name: 'port',
            message: 'Service port. used for both local and deploy',
            default: 6767,
            validate: function (value) {
              if (!isNaN(value)) {
                return true
              } else {
                return 'Please enter a number as the port'
              }
            }
          },
          {
            type: 'input',
            name: 'host',
            message: "An ip for service to be deployed on. use --xyzdev flag to override all ip's tp localhost",
            default: '127.0.0.1'
          }

        ]

        inquirer.prompt(questions).then(function (args) {
          fs.mkdir(`${process.cwd()}/${name}`)
          fs.writeFileSync(`${process.cwd()}/${name}/${name}.json`,
            `{"name": "${name}", "port" : ${args.port}, host: ${args.host}}`
          )

          fs.writeFileSync(`${process.cwd()}/${name}/${name}.js`, '')

          let xyz = require(`${process.cwd()}/xyz.json`)
          xyz.microservices.push({ name: name, port: args.port, host: args.host })
          fs.writeFileSync(`${process.cwd()}/xyz.json`, JSON.stringify(xyz, null, 4))
        })
      }
    } else {
      console.log(chalk.red('XYZ root direcotry not detected. run $ xyz init '))
    }
  })

program
  .command('dev')
  .option('-c, --config <conf>', 'run services using the xyz file given')
  .description('run one instace of each ms locally')
  .action(require('./commands/dev.command'))

program.parse(process.argv)
