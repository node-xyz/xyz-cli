const test = require('./../../commands/test')
const expect = require('chai').expect
const TOTAL = require('./../common').TOTAL
const _send = test.sendMessage
const config = require('./../../Configuration/config')

let processes
let identifiers = []
let TESTER

beforeEach(function (done) {
  console.log('\n############################################################## TEST ENV RESETED ##############################################################\n')
  this.timeout(10 * 1000)
  test.setUpTestEnv((p) => {
    processes = p
    identifiers = Object.keys(processes)
    TESTER = test.getTester()
    setTimeout(done, 5 * 1000)
  })
})

afterEach(function (done) {
  this.timeout(10 * 1000)
  for (let p in processes) {
    processes[p].kill()
  }
  setTimeout(done, 5 * 1000)
})

it('get', function (done) {
  TESTER.call({servicePath: 'node/get'}, (err, body, resp) => {
    expect(body.length).to.be.equal(TOTAL)
    done()
  })
})

it('msg', function (done) {
  config.msg(0, '/string/up', 'yo', (err, data) => {
    expect(err).to.equal(null)
    expect(data).to.equal('YO')
    done()
  })
})

it('kill', function (done) {
  TESTER.call({servicePath: '/node/kill', payload: identifiers[1]}, (err, body, resp) => {
    expect(body).to.equal('Done')
    setTimeout(() => {
      TESTER.call({servicePath: 'node/get'}, (err, body) => {
        expect(body.length).to.equal(TOTAL - 1)
        done()
      })
    }, 800)
  })
})

it('create', function (done) {
  this.timeout(15 * 1000)
  const _PORT = 6000
  TESTER.call({
    servicePath: '/node/create',
    payload: {
      path: 'test/stringMS/string.ms.js',
      params: `--xyz-transport.0.port ${_PORT} --xyz-cli.enable true --xyz-cli.stdio file`
    }
  }, (err, body, resp) => {
    expect(body).to.equal('Done')
    setTimeout(() => {
      TESTER.call({servicePath: 'node/get'}, (err, body) => {
        expect(body.length).to.equal(TOTAL + 1)
        expect(body[body.length - 1]).to.equal(`string.ms@127.0.0.1:${_PORT}`)
        TESTER.call({servicePath: '/node/kill', payload: `string.ms@127.0.0.1:${_PORT}`}, (err, body, resp) => {
          expect(body).to.equal('Done')
          setTimeout(() => {
            TESTER.call({servicePath: 'node/get'}, (err, body) => {
              expect(body.length).to.equal(TOTAL)
              done()
            })
          }, 800)
        })
      })
    }, 10 * 1000)
  })
})

it('duplicate', function (done) {
  TESTER.call({servicePath: '/node/duplicate', payload: '0'}, (err, body, resp) => {
    expect(body).to.equal('Done')
    setTimeout(() => {
      TESTER.call({servicePath: 'node/get'}, (err, body) => {
        expect(body.length).to.equal(TOTAL + 1)
        done()
      })
    }, 800)
  })
})

it('restart', function (done) {
  TESTER.call({servicePath: '/node/restart', payload: identifiers[0]}, (err, body, resp) => {
    expect(body).to.equal('Done')
    setTimeout(() => {
      TESTER.call({servicePath: 'node/get'}, (err, body) => {
        expect(body.length).to.equal(TOTAL)
        done()
      }, 800)
    })
  })
})
