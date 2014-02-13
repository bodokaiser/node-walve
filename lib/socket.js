var util   = require('util');
var stream = require('stream');

var Incoming = require('./incoming');

function Socket(socket, options) {
  this.source = socket;

  this.incoming = null;
  this.outgoing = null;

  listenToReadableEvent(this.source, this);
  listenToEndEvent(this.source, this);

  stream.Duplex.call(this, options);
}

util.inherits(Socket, stream.Duplex);

Socket.prototype._read = function() {
  var chunk = this.source.read();

  if (!this.incoming) {
    this.incoming = new Incoming();

    this.emit('message', this.incoming);
  }

  var bytesTooRead = this.incoming.bytesTooRead;

  this.incoming.write(chunk);

  this.push('');
};

Socket.prototype._write = function() {

};

module.exports = Socket;

function listenToReadableEvent(source, stream) {
  source.on('readable', function() {
    stream.read(0);
  });
}

function listenToEndEvent(source, stream) {
  source.on('end', function() {
    stream.push(null);
  });
}
