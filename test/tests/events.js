const test = require('./../../commands/test')
const expect = require('chai').expect
const _send = test.sendMessage
const TOTAL = require('./../common').TOTAL

let processes
let identifiers = []
let TESTER

before(function (done) {
  test.setUpTestEnv((p) => {
    processes = p
    identifiers = Object.keys(processes)
    TESTER = test.getTester()
    done()
  })
})

it('inspect events', function (done) {
  _send('inspect', processes[identifiers[0]], (data) => {
    expect(data.length).to.be.at.least(1000)
    _send('inspectJSON', processes[identifiers[0]], (data) => {
      expect(typeof (data)).to.equal('object')
      done()
    })
  })
})

it('network event', function (done) {
  setTimeout(() => {
    _send('network', processes['math.ms@127.0.0.1:4000'], (data) => {
      // two string clients are sending with 10msg/sec rate
      expect(data.snd).to.be.at.least(5)
      expect(data.rcv).to.be.at.least(15)
      done()
    })
  }, 5000)
  this.timeout(6000)
})

it('ping event', function (done) {
  _send('pingRate', processes[identifiers[0]], (data) => {
    expect(data.interval).to.be.at.least(0)
    done()
  })
})

after(function () {
  for (let p in processes) {
    processes[p].kill()
  }
})
