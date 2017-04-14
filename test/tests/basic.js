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
    TESTER = test.getTester()
    setTimeout(done, 4 * 1000)
  })
})

after(function () {
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
  }, 4 * 1000)
  this.timeout(11000)
})

it('a basic call/message test', function (done) {
  TESTER.call({servicePath: '/string/up', payload: 'yo'}, (err, body, resp) => {
    expect(body).to.equal('YO')
    done()
  })
})
