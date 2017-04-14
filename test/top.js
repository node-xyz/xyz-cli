
describe('basic', function () {
  describe('basic test as a hello world', function () {
    require('./tests/basic')
  })

  describe('arguments', function () {
    require('./tests/basic.arguments')
  })
})


describe('events', function () {
  require('./tests/events')
})

describe('admin', function () {
  describe('shared functions in xyz admin and tester.', function () {
    require('./tests/admin')
  })
})
