var util   = require('util');
var stream = require('readable-stream');

const FIN         = 0x80;
const RSV1        = 0x40;
const RSV2        = 0x20;
const RSV3        = 0x10;
const RSV_ALL     = RSV1 | RSV2 | RSV3;
const OPCODE      = 0x0f;
const MASKED      = 0x80;
const LENGTH      = 0x7f;
const LENGTH_EXT1 = 0x7e;
const LENGTH_EXT2 = 0x7f;

function Incoming(source, options) {
  this.header = null;
  this.inHeader = true;
  this.needsHeadBase = true;
  this.needsHeadExtended = false;

  this.rawHead = [];

  // TODO: move this.headLength to headBytesRead
  this.totalBytesRead = 0;
  this.payloadBytesRead = 0;
  this.payloadBytesToRead = 0;

  stream.Transform.call(this, options);
}

util.inherits(Incoming, stream.Transform);

Incoming.prototype._cache = function(chunk) {
  this.rawHead.push(chunk);

  return Buffer.concat(this.rawHead);
};

Incoming.prototype._transform = function(chunk, charset, done) {
  var header = this.header = this.header || {};

  if (this.inHeader) {
    chunk = this._cache(chunk);

    // buffer until we have two bytes to parse
    // and to calculated total head byte length
    if (chunk.length >= 2 && this.needsHeadBase) {
      if (RSV_ALL & chunk[0]) {
        this.emit('error', new Error('RSV flag should not be set.'));

        return;
      }

      header.final = !!(FIN & chunk[0]);
      header.masked = !!(MASKED & chunk[1])
      header.opcode = OPCODE & chunk[0];
      this.length = LENGTH & chunk[1];

      this.headLength = 2;
      if (header.masked) {
        this.headLength += 4;
      }
      if (this.length === LENGTH_EXT1) {
        this.headLength += 2;
      }
      if (this.length === LENGTH_EXT2) {
        this.headLength += 8;
      }
      this.totalBytesRead += 2;

      this.needsHeadBase = false;
      this.needsHeadExtended = true;
    }

    // buffer until we have all required head bytes and parse
    if (chunk.length >= this.headLength && this.needsHeadExtended) {
      header.length = this.length;
      if (header.masked) {
        header.masking = chunk.slice(this.headLength - 4);
      }
      switch (this.length) {
        case LENGTH_EXT1:
          header.length = chunk.readUInt16BE(2, 2);
          break;
        case LENGTH_EXT2:
          if (chunk.readUInt32BE(2, 4)) {
            this.emit('error', new Error('Payload length is too big.'));

            return;
          }
          header.length = chunk.readUInt32BE(6, 4);
          break;
      }
      this.totalBytesRead += chunk.length;
      this.payloadBytesToRead += header.length;

      this.inHeader = false;
      this.needsHeadExtended = false;

      this.emit('header', header);
    }

    // if we are finished with head bytes slice payload if in head length
    // else set chunk to null to avoid being consumed by stream
    if (!this.needsHeadBase && !this.needsHeadExtended) {
      chunk = chunk.slice(this.headLength);
    }
  }

  if (!this.inHeader) {
    // if we have more chunk then we need to read we probably got two frames
    // glued to each other. In this case we will flush them away.
    if (chunk.length > this.payloadBytesToRead) {
      this.emit('flush', chunk.slice(this.payloadBytesToRead));

      chunk = chunk.slice(0, this.payloadBytesToRead);
    }

    // unmask the payload
    if (header.masked) {
      for (var i = 0; i < chunk.length; i++) {
        chunk[i] = chunk[i] ^ header.masking[(i + this.payloadBytesRead) % 4];
      }
    }

    this.push(chunk);

    // update all counters
    this.totalBytesRead += chunk.length;
    this.payloadBytesRead += chunk.length;
    this.payloadBytesToRead -= chunk.length;

    if (!this.payloadBytesToRead) {
      this.push(null);
    }
  }

  done();
};

module.exports = Incoming;
