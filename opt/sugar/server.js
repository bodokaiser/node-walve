var util  = require('util');
var walve = require('../../lib');

function Sugar(options) {
  this.connections = [];

  listenToConnectEvent(this);

  walve.Server.call(this, options);
}

util.inherits(Sugar, walve.Server);

Sugar.prototype.broadcast = function(chunk) {
  this.connections.forEach(function(socket) {
    var outgoing = new walve.Outgoing({
      header: { length: chunk.length }
    });

    outgoing.pipe(socket, { end: false });
    outgoing.end(chunk);
  });

  return this;
};

module.exports = Sugar;

function listenToConnectEvent(server) {
  server.on('connect', function(socket) {
    server.connections.push(socket);

    socket.on('incoming', function(incoming) {
      if (incoming.header.opcode !== 0x01) return;
      if (incoming.header.length > 0x7d) return;

      var message = '';
      incoming.on('readable', function() {
        message += incoming.read().toString();
      });
      incoming.on('end', function() {
        socket.emit('text', message);
        server.emit('text', message, socket);
      });
    });
    socket.on('end', function() {
      var index = server.connections.indexOf(socket);

      server.connections.splice(index, 1);
    });
  });
}
