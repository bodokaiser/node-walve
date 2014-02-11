var util   = require('util');
var stream = require('stream');

const FIN         = 0x80;
const RSV1        = 0x40;
const RSV2        = 0x20;
const RSV3        = 0x10;
const OPCODE      = 0x0f;
const MASKED      = 0x80;
const LENGTH      = 0x7f;
const LENGTH_EXT1 = 0x7e;
const LENGTH_EXT2 = 0x7f;

function Incoming(source, options) {
  this.cache = [];

  this.fin = null;
  this.opcode = null;
  this.length = null;
  this.masked = null;
  this.maskingKey = null;

  this.headLength = 2;
  this.frameLength = 0;
  this.payloadRead = 0;
  this.payloadLength = 0;

  this.inHead = true;
  this.hadHead = false;

  stream.Transform.call(this, options);
}

util.inherits(Incoming, stream.Transform);

Incoming.prototype._cache = function(chunk) {
  this.cache.push(chunk);

  return Buffer.concat(this.cache);
};

Incoming.prototype._readHead1 = function(chunk) {
  if (RSV1 & chunk[0] || RSV2 & chunk[0] || RSV3 & chunk[0]) {
    return this.emit('error', new Error('Reserved flag is set.'));
  }

  this.fin = FIN & chunk[0];
  this.opcode = OPCODE & chunk[0];
  this.masked = MASKED & chunk[1];
  this.length = LENGTH & chunk[1];

  if (this.masked) {
    this.headLength += 4;
    this.frameLength += 4;
  }
  if (this.length === LENGTH_EXT1) {
    this.headLength += 2;
    this.frameLength += 2;
  }
  if (this.length === LENGTH_EXT2) {
    this.headLength += 8;
    this.frameLength += 8;
  }

  this.hadHead = true;
};

Incoming.prototype._readHead2 = function(chunk) {
  if (this.masked) {
    var offset = this.headLength - 4;
    this.maskingKey = chunk.slice(offset, 4);
  }
  switch (this.length) {
    case LENGTH_EXT1:
      this.payloadLength = chunk.readUInt16BE(2);
      break;
    case LENGTH_EXT2:
      if (chunk.readUInt16BE(2)) {
        return this.emit('error', new Error('Payload length too big.'));
      }
      this.payloadLength = chunk.readUInt32BE(6);
      break;
  }
};

Incoming.prototype._transform = function(chunk, charset, done) {
  if (this.inHead) {
    chunk = this._cache(chunk);

    if (chunk.length >= 2) {
      if (!this.hadHead) {
        this._readHead1(chunk);
      }
      if (chunk.length >= this.headLength) {
        this._readHead2(chunk);
        chunk = chunk.slice(this.headLength);
        this.frameLength += this.payloadLength;
        this.inHead = false;
        this.cache = [];
      }
    }
  }
  if (chunk) {
    this._readPayload(chunk);
  }
  if (this.payloadRead >= this.payloadLength) {
    this.push(null);
  }

  done();
};

Incoming.prototype._readPayload = function(chunk) {
  if (this.masked) unmask(chunk);
  this.payloadRead += chunk.length;
  this.push(chunk);
};

module.exports = Incoming;

function unmask(chunk, offset, masking) {
  for (var i = 0; i < chunk.length; i++) {
    chunk[i] = chunk[i] ^ masking[(i + offset) % 4];
  }
}
