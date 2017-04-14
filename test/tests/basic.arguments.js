const test = require('./../../commands/test')
const expect = require('chai').expect
const _send = test.sendMessage
const TOTAL = require('./../common').TOTAL

let processes
let identifiers = []
let TESTER

before(function (done) {
  console.log('\n############################################################## TEST ENV RESETED ##############################################################\n')
  this.timeout(10 * 1000)
  test.setUpTestEnv((p) => {
    processes = p
    identifiers = Object.keys(processes)
    console.log(identifiers)
    TESTER = test.getTester()
    setTimeout(done, 1 * 1000)
  }, 'xyztestrc_raw.json')
})

after(function () {
  for (let p in processes) {
    processes[p].kill()
  }
})

it('omitting everything except path', function (done) {
  _send('inspectJSON', processes[identifiers[0]], (data) => {
    expect(data.global.selfConf.transport[0].port).to.equal(5000)
    done()
    // _send('inspectJSON', processes[identifiers[1]], (data) => {
    //   expect(data.global.selfConf.transport[0].port).to.equal(7501)
    // })
  })
})
