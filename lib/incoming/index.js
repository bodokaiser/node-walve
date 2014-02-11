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
  this.inHead = true;
  this.needsHeadBase = true;
  this.needsHeadExtended = false;

  this.rawHead = [];

  this.bytesRead = 0;

  stream.Transform.call(this, options);
}

util.inherits(Incoming, stream.Transform);

Incoming.prototype._cache = function(chunk) {
  this.rawHead.push(chunk);

  return Buffer.concat(this.rawHead);
};

Incoming.prototype._transform = function(chunk, charset, done) {
  if (this.inHead) {
    chunk = this._cache(chunk);

    // buffer until we have two bytes to parse
    // and to calculated total head byte length
    if (chunk.length >= 2 && this.needsHeadBase) {
      if (RSV1 & chunk[0] | RSV2 & chunk[0] | RSV3 & chunk[0]) {
        this.emit('error', new Error('RSV flag should not be set.'));

        return;
      }

      this.final = FIN & chunk[0];
      this.opcode = OPCODE & chunk[0];
      this.masked = MASKED & chunk[1];
      this.length = LENGTH & chunk[1];

      this.headLength = 2;
      if (this.masked) {
        this.headLength += 4;
      }
      if (this.length === LENGTH_EXT1) {
        this.headLength += 2;
      }
      if (this.length === LENGTH_EXT2) {
        this.headLength += 8;
      }
      this.needsHeadBase = false;
      this.needsHeadExtended = true;
    }

    // buffer until we have all required head bytes and parse
    if (chunk.length >= this.headLength && this.needsHeadExtended) {
      this.payloadLength = this.length;
      switch (this.length) {
        case LENGTH_EXT1:
          this.payloadLength = chunk.readUInt16BE(2, 2);
          break;
        case LENGTH_EXT2:
          if (chunk.readUInt32BE(2, 4)) {
            this.emit('error', new Error('Payload length is too big.'));

            return;
          }
          this.payloadLength = chunk.readUInt32BE(6, 4);
          break;
      }
      if (this.masked) {
        this.masking = chunk.slice(this.headLength - 4);
      }
      this.inHead = false;
      this.needsHeadExtended = false;
    }

    // if we are finished with head bytes slice payload if in head length
    // else set chunk to null to avoid being consumed by stream
    if (!this.needsHeadBase && !this.needsHeadExtended) {
      chunk = chunk.slice(this.headLength);
    } else {
      chunk = null;
    }
  }

  // proceed with chunk if available else reread from source
  if (chunk && chunk.length) {
    if (this.masked) {
      for (var i = 0; i < chunk.length; i++) {
        chunk[i] = chunk[i] ^ this.masking[(i + this.bytesRead) % 4];
      }
    }
    this.push(chunk);
    this.bytesRead += chunk.length;
  } else {
    this.push('');
  }

  // if we read all payload from the frame end stream
  if (this.bytesRead >= this.payloadLength) {
    this.push(null);
  }

  done();
};

module.exports = Incoming;
