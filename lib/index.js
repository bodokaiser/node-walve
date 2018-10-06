exports.Server = require('./server')
exports.Socket = require('./socket')
exports.Incoming = require('./incoming')
exports.Outgoing = require('./outgoing')
exports.Response = require('./response')

exports.createServer = (listener) => {
  var server = new exports.Server()

  if (typeof listener === 'function') {
    server.on('connect', listener)
  }

  return server
}
