const config = require('./../Configuration/config')
const fork = require('./../commands/fork.js')
function adminBootstrap (xyz) {
  xyz.register('/node/get', (body, resp) => {
    resp.send(config.getNodes())
  })

  xyz.register('/node/create', (body, resp) => {
      
  })

  xyz.register('/node/restart/all', (body, resp) => {

  })

  xyz.register('/node/restart', (body, resp) => {
    
  })

  xyz.register('/node/kill', (body, resp) => {
    config.kill(body)
  })

  console.log(xyz)
}

module.exports = adminBootstrap
