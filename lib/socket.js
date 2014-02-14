var util   = require('util');
var stream = require('stream');

var Incoming = require('./incoming');

function Socket(socket, options) {
  this.source = socket;

  this.incoming = null;
  this.outgoing = null;

  this.incomingRead = 0;

  listenToReadableEvent(this.source, this);
  listenToEndEvent(this.source, this);

  stream.Duplex.call(this, options);
}

util.inherits(Socket, stream.Duplex);

Socket.prototype._read = function() {
  var chunk = this.source.read();

  // setup new incoming
  if (!this.incoming) {
    this.incoming = new Incoming();

    this.emit('message', this.incoming);
  }

  var headLength = this.incoming.headLength;
  var totalBytesRead = this.incoming.totalBytesRead;
  var payloadBytesToRead = this.incoming.payloadBytesToRead;

  // write base head bytes
  if (!headLength) {
    this.incoming.write(chunk.slice(0, 2));

    chunk = chunk.slice(2);
  }

  // write advanced head bytes
  if (headLength && headLength - totalBytesRead > 0) {
    var length = headLength - totalBytesRead;
    this.incoming.write(chunk.slice(0, length));

    chunk.slice(length);
  }

  // write remaining payload bytes
  if (payloadBytesToRead && chunk.length) {
    var next = chunk.slice(payloadBytesToRead);
    var current = chunk.slice(0, payloadBytesToRead);

    // when we wrote enough bytes we reset incoming for next frame
    if (payloadBytesToRead - current.length) {
      this.incoming.write(current);
    } else {
      this.incoming.end(current);
      this.incoming = null;

      this.unshift(next);
    }
  }

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
