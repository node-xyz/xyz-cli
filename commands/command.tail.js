let config = require('./../Configuration/config'),
  chalk = require('chalk')

let path = require('path')
let Tail = require('always-tail')

function tail (identifier, callback) {
  let node = config.chooseIdentifier(identifier, true)
  if (!node) {
    console.log(chalk.bold.red(`invalid identifier ${identifier}`))
    callback()
  }
  let dirname = path.dirname(config.getNodes()[node].process.spawnargs.slice(1, 2)[0])
  console.log(`[${dirname}/log/${node}.log] :: press ${chalk.bold('enter')} to exit\n`)
  console.log('############################################################')
  let tail = new Tail(`${dirname}/log/${node}.log`, '\n', {interval: 500})
  tail.on('line', function (data) {
    console.log(data)
  })

  tail.on('error', function (data) {
    console.log('error:', data)
    callback()
  })

  tail.watch()

  var stdin = process.openStdin()

  stdin.on('keypress', function (chunk, key) {
    if (key.name == 'enter') {
      tail.unwatch()
      callback()
    }
  })
}

module.exports = tail
