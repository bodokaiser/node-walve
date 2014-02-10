var util   = require('util');
var stream = require('stream');
var crypto = require('crypto');

function Outgoing(headers) {
  stream.Writable.call(this);

  this.fin = true;
  this.rsv1 = false;
  this.rsv2 = false;
  this.rsv3 = false;
  this.masked = false;

  this.opcode = 0x01;
  this.length = 0x00;

  this.masking = null;

  overwriteHeaders(this, headers);

  this.socket = null;

  this.sendingHeaders = false;
  this.sentHeaders = false;

  this.bytesWritten = 0;
}

util.inherits(Outgoing, stream.Writable);

Outgoing.prototype._write = function(chunk, encoding, done) {
  if (!this.socket)
    throw new Error('You must assign a socket before write.');

  if (this.sendingHeaders) {
    this.socket.write(chunk);

    return done();
  }

  if (!this.sentHeaders)
    throw new Error('You must write the frame head before.');

  if (this.length < this.bytesWritten + chunk.length)
    throw new Error('You cannot write a bigger payload then defined in head.');

  if (this.masked && this.masking.length == 4)
    chunk = maskChunk(this.masking, chunk, this.bytesWritten);

  this.bytesWritten += chunk.length;

  this.socket.write(chunk);

  done();
};

Outgoing.prototype.writeHead = function(headers) {
  if (this.sentHeaders)
    throw new Error('You cannot rewrite a sent head.');

  overwriteHeaders(this, headers);

  this.sendingHeaders = true;

  var head = [];
  head.push(createFirstByte(this));
  head.push(createSecondByte(this));
  head.push(createAdditionalBytes(this));

  this.write(Buffer.concat(head));

  this.sendingHeaders = false;
  this.sentHeaders = true;

  return this;
};

Outgoing.prototype.assignSocket = function(socket) {
  this.socket = socket;

  return this;
};

module.exports = Outgoing;

function overwriteHeaders(source, headers) {
  for (var key in headers)
    source[key] = headers[key];

  return source;
}

function createFirstByte(outgoing) {
  var header = new Buffer(1);

  header.fill(0);

  if (outgoing.fin)
    header[0] |= 0x80;

  if (outgoing.rsv1)
    header[0] |= 0x40;

  if (outgoing.rsv2)
    header[0] |= 0x20;

  if (outgoing.rsv3)
    header[0] |= 0x10;

  if (outgoing.opcode)
    header[0] |= outgoing.opcode;

  return header;
}

function createSecondByte(outgoing) {
  var header = new Buffer(1);

  header.fill(0);

  if (outgoing.masked)
    header[0] |= 0x80;

  if (outgoing.length < 0x7e)
    header[0] |= outgoing.length;
  if (outgoing.length > 0x7d && outgoing.length < 0x10000)
    header[0] |= 0x7e;
  if (outgoing.length > 0xffff)
    header[0] |= 0x7f;

  return header;
}

function createAdditionalBytes(outgoing) {
  var buffer = [];

  if (outgoing.length > 0x7d && outgoing.length < 0x10000) {
    var lengthBytes = new Buffer(2);

    lengthBytes.writeUInt16BE(outgoing.length, 0);
  }
  if (outgoing.length > 0xffff) {
    var lengthBytes = new Buffer(8);

    lengthBytes.fill(0);
    lengthBytes.writeUInt32BE(outgoing.length, 4); 
  }

  if (outgoing.masked) {
    if (outgoing.masking && outgoing.masking.length == 4) {
      var maskingBytes = outgoing.masking;
    } else {
      var maskingBytes = generateMasking();

      outgoing.masking = maskingBytes;
    }
  }

  if (lengthBytes) buffer.push(lengthBytes);
  if (maskingBytes) buffer.push(maskingBytes);

  return Buffer.concat(buffer);
}

function maskChunk(masking, chunk, offset) {
  for (var i = 0; i < chunk.length; i++)
  chunk[i] = chunk[i] ^ masking[(i + offset) % 4];

  return chunk;
}

function generateMasking() {
  return crypto.randomBytes(4);
}
