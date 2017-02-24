const config = require('./../Configuration/config')
const fork = require('./../commands/fork.js')

function CLIadminBootstrap (xyz) {
  xyz.register('/node/get', (body, resp) => {
    resp.jsonify(Object.keys(config.getNodes()))
  })

  // create a new microservice. body should contain `nodePath` and `params`
  // example:
  // curl -X POST -H "Content-Type: application/json" -d \
  //    '{"service":"/node/create", \
  //      "userPayload":{"path":"stringMS/string.ms.js", "params": "--xyz-logLevel info --xyz-allowJoin true --xyz-name math.ms --xyz-port 6000 --xyz-cli.enable true --xyz-cli.stdio file"}}'  -i "http://localhost:9000/call"
  xyz.register('/node/create', (body, resp) => {
    config.create(body.path, body.params, (err) => {
      if (err) {
        resp.jsonify(err)
      } else {
        resp.jsonify('Done')
      }
    })
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
        resp.jsonify('Done')
      } else {
        resp.jsonify(err, 401)
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
        resp.jsonify('Done')
      } else {
        resp.jsonify(err, 401)
      }
    })
  })

  // body should be identifier or id
  xyz.register('/node/duplicate', (body, resp) => {
    config.duplicate(body, (err) => {
      if (err) {
        resp.jsonify(err, 401)
      } else {
        resp.jsonify(`Done`)
      }
    })
  })

  // body should be identifier and NOT ID
  // example:
  // curl -X POST -H "Content-Type: application/json" -d \
  //  '{"service":"/node/inspect","userPayload":"string.ms@127.0.0.1:2000"}'  -i "http://localhost:9000/call"
  xyz.register('/node/inspect', (body, resp) => {
    // we will listen to this only once
    // BUG: this will cause the inspect value to be printed to the console too

    config.inspect(body, false, (err, data) => {
      if (err) {
        resp.jsonify(err, 401)
      } else {
        resp.jsonify(data)
      }
    })
  })

  xyz.register('/node/inspectJSON', (body, resp) => {
    // we will listen to this only once
    // BUG: this will cause the inspect value to be printed to the console too
    config.inspect(body, true, (err, data) => {
      if (err) {
        resp.jsonify(err)
      } else {
        resp.jsonify(data)
      }
    })
  })

  console.log(xyz)
}

module.exports = CLIadminBootstrap
