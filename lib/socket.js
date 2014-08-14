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
  listenToTimeoutEvent(this.source, this);
  listenToFinishEvent(this.source, this);
  listenToEndEvent(this.source, this);

  stream.Duplex.call(this, {
    allowHalfOpen: false
  });
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
  stream.incoming.once('header', function(header) {
    if (isValidOpcode(header.opcode)) {
      stream.emit('incoming', stream.incoming);

      return;
    }

    stream.emit('error', new Error('Invalid opcode ' + header.opcode + '.'));
  });
  stream.incoming.once('flush', function(chunk) {
    createIncoming(stream);
    stream.incoming.write(chunk);
  });
}

function listenToReadableEvent(source, stream) {
  source.on('readable', function() {
    stream.read(0);
  });
}

function listenToTimeoutEvent(source, stream) {
  source.once('timeout', function() {
    var outgoing = new Outgoing({
      header: { opcode: 0x08 }
    });

    outgoing.pipe(source);
    outgoing.end('');
  });
}

function listenToFinishEvent(source, stream) {
  stream.once('finish', function() {
    source.end();
  });
}

function listenToEndEvent(source, stream) {
  source.once('end', function() {
    stream.push(null);
    stream.emit('close');
  });
}

function isValidOpcode(opcode) {
  if (opcode < 0x03) {
    return true
  }

  if (opcode > 0x07 && opcode < 0x0b) {
    return true
  }

  return false
}
