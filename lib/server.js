var util   = require('util');
var http   = require('http');
var events = require('events');
var crypto = require('crypto');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function Server(options) {
  options = options || {};

  events.EventEmitter.call(this, options);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function(server) {
  var self = this;

  server.on('upgrade', function(request, socket) {
    var accept = generateAccept(request.headers['sec-websocket-key']);

    var response = new http.ServerResponse(request);
    response.statusCode = 101;
    response.setHeader('Upgrade', 'websocket');
    response.setHeader('Connection', 'Upgrade');
    response.setHeader('Sec-WebSocket-Accept', accept);
    response.setHeader('Sec-WebSocket-Version', '13');
    response.assignSocket(socket);
    response.end();

    self.emit('connect');
  });

  return this;
};

module.exports = Server;

function generateAccept(key) {
  var accept = key.trim().replace(' ', '') + GUID;

  return crypto.createHash('sha1').update(accept).digest('base64');
}
