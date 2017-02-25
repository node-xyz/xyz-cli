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
    console.log('##############################################################')
    setTimeout(done, 1000)
  })
})

afterEach(function () {
  for (let p in processes) {
    processes[p].kill()
  }
})

it('basic setup for tester env', function (done) {
  expect(Object.keys(processes).length).to.equal(TOTAL)
  setTimeout(() => {
    _send('inspectJSON', processes[identifiers[0]], (data) => {
      expect(data.global.systemConf.nodes.length).to.equal(TOTAL + 1)
      _send('inspectJSON', processes[identifiers[1]], (data) => {
        expect(data.global.systemConf.nodes.length).to.equal(TOTAL + 1)
        _send('inspectJSON', processes[identifiers[2]], (data) => {
          expect(data.global.systemConf.nodes.length).to.equal(TOTAL + 1)
          done()
        })
      })
    })
  }, 10000)
  this.timeout(11000)
})

it('a basic call test', function (done) {
  TESTER.call({servicePath: '/string/up', payload: 'yo'}, (err, body, resp) => {
    expect(body).to.equal('YO')
    done()
  })
})
