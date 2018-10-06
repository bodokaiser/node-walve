const {
  EventEmitter
} = require('events')

const Socket = require('./socket')
const Response = require('./response')


class Server extends EventEmitter {

  constructor(options) {
    super(options)

    options = options || {}
    this.url = options.url
  }

  listen(server) {
    var self = this

    server.on('upgrade', (request, socket) => {
      if (self.url && request.url !== self.url) return

      let response = new Response(request)
      response.assignSocket(socket)
      response.end()

      self.emit('connect', new Socket(socket))
    })

    return this
  }

}

module.exports = Server
