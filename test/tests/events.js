const test = require('./../../commands/test')
const expect = require('chai').expect
const _send = test.sendMessage
const TOTAL = require('./../common').TOTAL

let processes
let identifiers = []
let TESTER

beforeEach(function (done) {
  test.setUpTestEnv((p) => {
    processes = p
    identifiers = Object.keys(processes)
    TESTER = test.getTester()
    console.log('#####################################################################################')
    setTimeout(done, 3000)
  })
  this.timeout(5500)
})

afterEach(function () {
  for (let p in processes) {
    processes[p].kill()
  }
})

it('inspect events', function (done) {
  _send('inspect', processes[identifiers[0]], (data) => {
    expect(data.length).to.be.at.least(1000)
    setTimeout(() => {
      _send('inspectJSON', processes[identifiers[1]], (data) => {
        expect(typeof (data)).to.equal('object')
        done()
      })
    }, 1000)
  })
  this.timeout(4000)
})

it('network event', function (done) {
  setTimeout(() => {
    let mathIdent = identifiers.filter((id) => id.match(/math/) !== null)
    _send('network', processes[mathIdent[0]], (data) => {
      // two string clients are sending with 10msg/sec rate
      expect(data.snd).to.be.at.least(5)
      expect(data.rcv).to.be.at.least(15)
      done()
    })
  }, 13000)
  this.timeout(15000)
})

it('ping event', function (done) {
  setTimeout(() => {
    _send('pingRate', processes[identifiers[0]], (data) => {
      expect(data.interval).to.be.at.least(0)
      done()
    })
  }, 4000)
  this.timeout(5000)
})
