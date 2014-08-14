var util   = require('util');
var stream = require('stream');
var crypto = require('crypto');

const FINAL       = 0x80;
const OPCODE      = 0x01;
const MASKED      = 0x80;
const LENGTH_EXT1 = 0x7e;
const LENGTH_EXT2 = 0x7f;
const MAX_LENGTH  = 0x100000000;

function Outgoing(options) {
  options = options || {};

  this.header = options.header || {};

  this.hadHead = false;
  this.hadPayload = false;

  this.bytesTransformed = 0;
  this.bytesToTransform = 0;

  stream.Transform.call(this, options);
}

util.inherits(Outgoing, stream.Transform);

Outgoing.prototype._transform = function(chunk, charset, done) {
  if (!this.hadHead) {
    this._transformHead();
  }
  if (!this.hadPayload && this.hadHead) {
    this._transformPayload(chunk);
  }

  done();
};

Outgoing.prototype._transformHead = function(chunk, charset) {
  var headLength, headMasking, headBase = new Buffer([0x00, 0x00]);

  if (this.header.final || this.header.final === undefined) {
    headBase[0] |= FINAL;
  }
  if (this.header.opcode === undefined) {
    headBase[0] |= OPCODE;
  } else {
    headBase[0] |= this.header.opcode;
  }
  if (this.header.masked) {
    if (!this.header.masking) {
      this.header.masking = crypto.randomBytes(4);
    }
     
    headBase[1] |= MASKED;
    headMasking = this.header.masking;
  }

  this.header.length = this.header.length || 0;

  if (this.header.length < 0x7e) {
    headBase[1] |= this.header.length || 0x00;
  }
  if (this.header.length >= 0x7e && this.header.length <= 0xffff) {
    headBase[1] |= LENGTH_EXT1;
    headLength = new Buffer(2);
    headLength.writeUInt16BE(this.header.length, 0);
  }
  if (this.header.length > 0xffff) {
    headBase[1] |= LENGTH_EXT2;
    headLength = new Buffer(8);
    headLength.writeUInt32BE(0x00, 0);
    headLength.writeUInt32BE(this.header.length, 4);
  }
  if (this.header.length > MAX_LENGTH) {
    this.emit('error', new Error('Payload length too big.'));

    return;
  }

  this.hadHead = true;

  if (headBase) this.push(headBase);
  if (headLength) this.push(headLength);
  if (headMasking) this.push(headMasking);

  this.bytesToTransform = this.header.length;
};

Outgoing.prototype._transformPayload = function(chunk, charset) {
  if (this.header.masked) {
    for (var i = 0; i < chunk.length; i++) {
      var index = i + this.bytesTransformed;
      chunk[i] = chunk[i] ^ this.header.masking[index % 4];
    }
  }

  this.push(chunk.slice(0, this.bytesToTransform));

  this.bytesTransformed += chunk.length;
  this.bytesToTransform -= chunk.length;

  if (!this.bytesToTransform) {
    this.hadPayload = true;
    this.push(null);
  }
};

module.exports = Outgoing;
