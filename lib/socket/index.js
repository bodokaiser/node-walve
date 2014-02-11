var util   = require('util');
var stream = require('stream');

var Incoming = require('./incoming');

function Socket(socket, options) {
  this.source = socket;

  stream.Duplex.call(this, options);
}

util.inherits(Socket, stream.Duplex);

Socket.prototype._read = function() {

};

Socket.prototype._write = function() {

};

module.exports = Socket;
