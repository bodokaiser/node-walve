var util   = require('util');
var http   = require('http');
var crypto = require('crypto');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function Response(request) {
  http.ServerResponse.call(this, request);

  var accept = generateAccept(request);

  this.statusCode = 101;
  this.setHeader('Upgrade', 'websocket');
  this.setHeader('Connection', 'Upgrade');
  this.setHeader('Sec-WebSocket-Accept', accept);
  this.setHeader('Sec-WebSocket-Version', '13');
}

util.inherits(Response, http.ServerResponse);

module.exports = Response;

function generateAccept(request) {
  var key = request.headers['sec-websocket-key'].replace(' ', '') + GUID;

  return crypto.createHash('sha1').update(key).digest('base64');
}
