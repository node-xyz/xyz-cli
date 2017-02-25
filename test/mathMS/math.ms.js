let fn = require('./../mock.functions')
let XYZ = require('xyz-core')

var mathMs = new XYZ({
  selfConf: {
    name: 'math.ms',
    host: '127.0.0.1'
  },
  systemConf: { nodes: []}.
})

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
