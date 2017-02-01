let os = require('os'),
  chalk = require('chalk'),
  clui = require('clui')
let config = require('./../Configuration/config')
var Gauge = clui.Gauge
let vorpal

let nodes = []
let nodesInfo = {}

// TODO
// it is very important for these events to have a gap between them
// this is because we switched to once() instead of on()
// we'll try to keep it this way cuase this makes the `config.js` code more
// coherent

turn = true
function updateInspect () {
  if (turn) {
    for (let node of nodes) {
      config.inspect(node, true, function (_node, err, data) {
        if (!nodesInfo[_node]) {
          nodesInfo[_node] = {cpu: 0, mem: {}, net: {}}
        }
        nodesInfo[_node].cpu = data.global.machineReport.cpu
        nodesInfo[_node].mem = data.global.machineReport.mem
      }.bind(null, node))
    }
  } else {
    for (let node of nodes) {
      config.network(node, function (_node, err, data) {
        if (!nodesInfo[_node]) {
          nodesInfo[_node] = {cpu: 0, mem: {}, net: {}}
        }
        nodesInfo[_node].net = data
      }.bind(null, node))
    }
  }
  turn = !turn
}

function top (callback, vorpal) {
  nodes = Object.keys(config.getNodes())
  vorpal = vorpal
  let output = ``
  console.log(`press ${chalk.bold('enter')} to exit\n`)
  updateInspect()
  let update = setInterval(updateInspect, 1000)
  let render = setInterval(() => {
    for (let node in nodesInfo) {
      output += `${chalk.bold.blue(node)}::\n`

      output += `[$Network send] ${chalk.bold(nodesInfo[node].net.snd)} req/sec | `
      output += `[Network receive] ${chalk.bold(nodesInfo[node].net.rcv)} req/sec\n`

      output += `[User CPU] ` + `${nodesInfo[node].cpu.user / 1000} sec | `
      output += `[System CPU] ` + `${nodesInfo[node].cpu.system / 1000} sec \n`
      output += `[Heap]` + Gauge(nodesInfo[node].mem.heapUsed, nodesInfo[node].mem.heapTotal, 20, nodesInfo[node].mem.heapTotal * 0.8, `${nodesInfo[node].mem.heapUsed / 1000000} / ${nodesInfo[node].mem.heapTotal / 1000000} MB\n\n`)
    }
    // console.log(output)
    vorpal.ui.redraw(output)
    output = ``
  }, 1000)

  // is this a one time thing?
  var stdin = process.openStdin()

  stdin.on('keypress', function (chunk, key) {
    if (key.name == 'enter') {
      clearInterval(update)
      clearInterval(render)
      vorpal.ui.redraw.done()
      callback()
    }
  })
}

module.exports = top
