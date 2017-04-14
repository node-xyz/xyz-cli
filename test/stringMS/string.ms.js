let fn = require('./../mock.functions')
let XYZ = require('xyz-core')

var stringMs = new XYZ({
  selfConf: {
    logLevel: 'debug',
    seed: ['127.0.0.1:4000'],
    name: 'string.ms',
    host: '127.0.0.1',
    transport: [{type: 'HTTP', port: 5000}]
  },
  systemConf: {
    nodes: []
  }
})

stringMs.register('/string/down', fn.down)
stringMs.register('/string/up', fn.up)
stringMs.register('/finger', fn.finger)

setInterval(() => {
  stringMs.call({
    servicePath: '/math/decimal/*',
    payload: { x: 1000000, y: new Date().getTime() }
  }, (err, body, res) => {
    // console.error('response of decimal/*', body)
  })
}, 1000)
