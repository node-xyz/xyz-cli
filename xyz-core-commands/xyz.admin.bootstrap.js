const config = require('./../Configuration/config')

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
