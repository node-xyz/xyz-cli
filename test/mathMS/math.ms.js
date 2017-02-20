let fn = require('./../../../xyz-core/test/ms/mock.functions')
let XYZ = require('xyz-core')
let sendToAll = require('xyz.service.send.to.all')
// let monitorBootstrap = require('xyz.monitor.basic.bootstrap').bootstrap
//
// let basicAuthRcv = require('xyz.transport.auth.basic.receive')
// let basicAuthSnd = require('xyz.transport.auth.basic.send')

var mathMs = new XYZ({
  selfConf: {
    name: 'math.ms',
    host: '127.0.0.1',
    defaultSendStrategy: sendToAll
  },
  systemConf: { nodes: []}
})

// mathMs.bootstrap(monitorBootstrap, 0)
//
// mathMs.middlewares().transport.client('JOIN').register(0, basicAuthSnd)
// mathMs.middlewares().transport.server('JOIN').register(0, basicAuthRcv)

mathMs.register('/math/decimal/mul', fn.mul)
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)
mathMs.register('/blank', fn.blank)
mathMs.register('/math/float/neg', fn.neg)

setInterval(() => {
  mathMs.call({
    servicePath: '/string/up',
    payload: 'yo'
  }, (err, body, res) => {
    console.error('response of /string/up', body)
  })
}, 100)

console.log(mathMs)
