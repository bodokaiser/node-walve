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
    createIncoming(this);
  }

  if (chunk === null) {
    return this.push('');
  } else {
    this.incoming.write(chunk);
  }

  this.push('');
};

Socket.prototype._write = function() {

};

module.exports = Socket;

function createIncoming(stream) {
  stream.incoming = new Incoming();
  stream.incoming.once('flush', function(chunk) {
    createIncoming(stream);
    stream.incoming.write(chunk);
  });
  stream.emit('message', stream.incoming);
}

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
