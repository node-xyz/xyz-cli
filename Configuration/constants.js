module.exports = {
  STDIO: {
    console: 'console',
    file: 'file'
  },
  intervals: {
    killNodeAfterInit: 5000
  },
  defaultRcConfig: {
    selfConf: {
      logLevel: 'verbose',
      name: 'xyz-admin',
      transport: [{type: 'HTTP', port: 9000}],
      host: '127.0.0.1'
    },
    systemConf: {}
  },
  defaultNodeConfig: {
    port: 5000,
    instance: 1,
    increment: 1,
    stdio: 'console'
  }
}
