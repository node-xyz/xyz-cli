const test = require('./../../commands/test')
const expect = require('chai').expect
const TOTAL = require('./../common').TOTAL
const _send = test.sendMessage

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

it('duplicate', function (done) {
  TESTER.call({servicePath: '/node/duplicate', payload: identifiers[0]}, (err, body, resp) => {
    expect(body).to.equal('Done')
    done()
  })
})

it('restart', function (done) {
  TESTER.call({servicePath: '/node/restart', payload: identifiers[0]}, (err, body, resp) => {
    expect(body).to.equal('Done')
    done()
  })
})

it('kill', function (done) {
  TESTER.call({servicePath: '/node/kill', payload: identifiers[1]}, (err, body, resp) => {
    expect(body).to.equal('Done')
    done()
  })
})

after(function () {
  for (let p in processes) {
    processes[p].kill()
  }
})
