const config = require('./../config/config')

function adminBootstrap (xyz) {
  xyz.register('/node/get', (body, resp) => {
    resp.send(config.getNodes())
  })

  xyz.register('/node/kill', (body, resp) => {
    config.kill(body)
  })

  console.log(xyz)
}

module.exports = adminBootstrap
