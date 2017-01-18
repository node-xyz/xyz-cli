const config = require('./../Configuration/config')
const fork = require('./../commands/fork.js')

function adminBootstrap (xyz) {
  xyz.register('/node/get', (body, resp) => {
    resp.send(config.getNodes())
  })

  // create a new microservice. body should contain `nodePath` and `params`
  // example:
  // curl -X POST -H "Content-Type: application/json" -d \
  //    '{"service":"/node/create", \
  //      "userPayload":{"nodePath":"stringMS/string.ms.js", "params": "--xyz-logLevel info --xyz-allowJoin true --xyz-name math.ms --xyz-port 6000 --xyz-cli.enable true --xyz-cli.stdio file"}}'  -i "http://localhost:9000/call"
  xyz.register('/node/create', (body, resp) => {
    config.create(body.nodePath, body.params)
    resp.send('created')
  })

  // restart a specific node indicated in the body.
  // similar to other APIs, the body should contain a node Identifier: "[NAME]@[HOST]:[PORT]"
  // example:
  // ```
  //  curl -X POST -H "Content-Type: application/json" -d \
  // '{"service":"/node/restart","userPayload":"stringMs@127.0.0.1:3000"}'  -i "http://localhost:9000/call"
  // ```
  xyz.register('/node/restart', (body, resp) => {
    config.restart(body, (err) => {
      if (!err) {
        resp.send('Restarted')
      } else {
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
      if (!err) {
        resp.send('Killed')
      } else {
        resp.send(err)
      }
    })
  })

  console.log(xyz)
}

module.exports = adminBootstrap
