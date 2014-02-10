var util      = require('util');
var http      = require('http');
var events    = require('events');
var wsupgrade = require('websocket-upgrade');
var Socket    = require('./socket');

function Server(listener, options) {
  options = options || {};

  events.EventEmitter.call(this);

  this.masked = false;
  this.connections = [];

  if (options.timeout)
    this.timeout = options.timeout;

  if (listener)
    this.addListener('open', listener);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.broadcast = function(message) {
  this.connections.forEach(function(socket) {
    socket.send(message);
  });
};

Server.prototype.listen = function(server) {
  var self = this;

  server.on('upgrade', function(request, socket) {
    var error = handleUpgrade(request, socket);

    if (error) return self.emit('error', error);

    socket.setTimeout(self.timeout);

    handleStream(self, socket);
  });

  return this;
};

module.exports = Server;

function handleUpgrade(request, socket, callback) {
  var error = wsupgrade.validateUpgradeRequest(request);

  if (error) {
    var response = new http.ServerResponse(request);

    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.write('Invalid HTTP WebSocket upgrade request.\n');
    response.end();

    return error;
  }

  var response = new wsupgrade.UpgradeResponse(request);

  response.assignSocket(socket);
  response.end();

  return null;
}

function handleStream(server, socket) {
  var wsocket = new Socket(socket);

  wsocket.on('pong', function(incoming, outgoing) {
    server.emit('pong', wsocket, incoming, outgoing);
  });

  wsocket.on('close', function(incoming, outgoing) {
    server.emit('close', wsocket, incoming);
  });

  wsocket.on('message', function(incoming, outgoing) {
    server.emit('message', wsocket, incoming, outgoing);
  });

  wsocket.on('error', function(error) {
    server.emit('error', wsocket, error);
  });

  wsocket.on('close', function() {
    var n = server.connections.indexOf(wsocket);

    server.connections.splice(n, 1);
    server.emit('close', wsocket);
  });

  server.connections.push(wsocket);

  server.emit('open', wsocket, server);
}
