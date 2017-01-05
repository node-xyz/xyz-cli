const config = require('./../Configuration/config')
const fork = require('./../commands/fork.js')
function adminBootstrap (xyz) {

  xyz.register('/node/get', (body, resp) => {
    resp.send(config.getNodes())
  })

  xyz.register('/node/create', (body, resp) => {
      
  })

  xyz.register('/node/restart/all', (body, resp) => {
    for (let node of config.getNodes()) {
      
    }
  })

  // restart a specific node indicated in the body. 
  // similar to other APIs, the body should contain a node Identifier: "[NAME]@[HOST]:[PORT]"
  xyz.register('/node/restart', (body, resp) => {
    config.restart(body, (err) => {
      if (!err) {
        resp.send('Restarted')
      }
      else {
        resp.send(err)
      }
    })
  })

  // takes a node identifier and kills a process with that sig. if any.
  // example: 
  // ```
  //    curl -X POST -H "Content-Type: application/json" -d \
  //    '{"service":"/node/kill","userPayload":"stringMs@127.0.0.1:3000"}'  -i "http://localhost:9000/call"
  // ``` 
  xyz.register('/node/kill', (body, resp) => {
    config.kill(body, (err) => {
      
    })
  })

  console.log(xyz)
}

module.exports = adminBootstrap
