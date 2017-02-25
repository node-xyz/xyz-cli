const test = require('./../../commands/test')
const expect = require('chai').expect
const TOTAL = require('./../common').TOTAL
const _send = test.sendMessage

let processes
let identifiers = []
let TESTER

beforeEach(function (done) {
  test.setUpTestEnv((p) => {
    processes = p
    identifiers = Object.keys(processes)
    TESTER = test.getTester()
    console.log('#####################################################################################')
    setTimeout(done, 1000)
  })
})

afterEach(function () {
  for (let p in processes) {
    processes[p].kill()
  }
})

it('kill', function (done) {
  TESTER.call({servicePath: '/node/kill', payload: identifiers[1]}, (err, body, resp) => {
    expect(body).to.equal('Done')
    TESTER.call({servicePath: 'node/get'}, (err, body) => {
      expect(body.length).to.equal(TOTAL - 1)
      done()
    })
  })
})

it('duplicate', function (done) {
  TESTER.call({servicePath: '/node/duplicate', payload: '0' }, (err, body, resp) => {
    expect(body).to.equal('Done')
    TESTER.call({servicePath: 'node/get'}, (err, body) => {
      expect(body.length).to.equal(TOTAL)
      done()
    })
  })
})

it('restart', function (done) {
  TESTER.call({servicePath: '/node/restart', payload: identifiers[0]}, (err, body, resp) => {
    expect(body).to.equal('Done')
    TESTER.call({servicePath: 'node/get'}, (err, body) => {
      expect(body.length).to.equal(TOTAL)
      done()
    })
  })
})

it('get', function (done) {
  TESTER.call({servicePath: 'node/get'}, (err, body, resp) => {
    expect(body.length).to.be.equal(TOTAL)
    done()
  })
})

it('create', function (done) {
  const _PORT = 6000
  TESTER.call({
    servicePath: '/node/create',
    payload: {
      path: 'test/stringMS/string.ms.js',
      params: `--xyz-transport.0.port ${_PORT} --xyz-cli.enable true --xyz-cli.stdio file`
    }
  }, (err, body, resp) => {
    TESTER.call({servicePath: 'node/get'}, (err, body) => {
      expect(body.length).to.equal(4)
      expect(body[body.length - 1]).to.equal(`string.ms@127.0.0.1:${_PORT}`)
      done()
    })
  })
})
