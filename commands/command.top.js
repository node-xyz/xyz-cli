let os = require('os'),
  chalk = require('chalk'),
  clui = require('clui')
let config = require('./../Configuration/config')
var Gauge = clui.Gauge
let vorpal

let nodes = Object.keys(config.getNodes())
let nodesInfo = {}
function updateInspect () {
  for (let node of nodes) {
    config.inspect(node, true, function (_node, err, data) {
      if (!nodesInfo[_node]) {
        nodesInfo[_node] = {cpu: 0, mem: {}}
      }
      nodesInfo[_node].cpu = data.global.machineReport.cpu
      nodesInfo[_node].mem = data.global.machineReport.mem
    }.bind(null, node))
  }
}

function render () {

}
function top (callback, vorpal) {
  vorpal = vorpal
  let output = ``
  console.log(`press ${chalk.bold('enter')} to exit\n`)
  updateInspect()
  let update = setInterval(updateInspect, 2000)
  let render = setInterval(() => {
    for (let node in nodesInfo) {
      output += `${chalk.bold.blue(node)}::\n[User CPU]` + `${nodesInfo[node].cpu.user * 1000} sec `
      output += `[System CPU]` + `${nodesInfo[node].cpu.system * 1000} sec \n`
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
