var util   = require('util');
var stream = require('stream');

var Incoming = require('./incoming');
var Outgoing = require('./outgoing');

function Socket(socket, options) {
  options = options || {};

  this.source = socket;
  this.incoming = null;

  if (options.timeout) {
    socket.setTimeout(options.timeout);
  }

  listenToReadableEvent(this.source, this);
  listenToEndingEvent(this.source, this);

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

Socket.prototype._write = function(chunk, charset, done) {
  this.source.write(chunk);

  done();
};

module.exports = Socket;

function createIncoming(stream) {
  stream.incoming = new Incoming();
  stream.incoming.once('flush', function(chunk) {
    createIncoming(stream);
    stream.incoming.write(chunk);
  });
  stream.emit('incoming', stream.incoming);
}

function listenToReadableEvent(source, stream) {
  source.on('readable', function() {
    stream.read(0);
  });
}

function listenToEndingEvent(source, stream) {
  source.once('timeout', function() {
    var outgoing = new Outgoing({
      header: { opcode: 0x08 }
    });

    outgoing.pipe(source);
    outgoing.end('');
  });
  source.once('end', function() {
    stream.push(null);
    stream.emit('close');
  });
}
