const {
  Server,
  Outgoing
} = require('../../lib')


class Sugar extends Server {

  constructor(options) {
    super(options)

    this.connections = []

    listenToConnectEvent(this)
  }

  broadcast(chunk) {
    this.connections.forEach(socket => {
      let outgoing = new Outgoing({
        header: {
          length: chunk.length
        }
      });

      outgoing.pipe(socket, {
        end: false
      });
      outgoing.end(chunk);
    })

    return this
  }

}

module.exports = Sugar

function listenToConnectEvent(server) {
  server.on('connect', socket => {
    server.connections.push(socket)

    socket.on('incoming', incoming => {
      if (incoming.header.opcode !== 0x01) return
      if (incoming.header.length > 0x7d) return

      var message = ''
      incoming.on('readable', () => {
        message += incoming.read().toString()
      })
      incoming.on('end', () => {
        socket.emit('text', message)
        server.emit('text', message, socket)
      })
    })
    socket.on('end', () => {
      let index = server.connections.indexOf(socket);

      server.connections.splice(index, 1);
    })
  })
}
