const {
  randomBytes
} = require('crypto')
const {
  Transform
} = require('readable-stream')

const FINAL       = 0x80
const OPCODE      = 0x01
const MASKED      = 0x80
const LENGTH_EXT1 = 0x7e
const LENGTH_EXT2 = 0x7f
const MAX_LENGTH  = 0x100000000


class Outgoing extends Transform {

  constructor(options) {
    super(options)

    options = options || {}

    this.header = options.header || {}

    this.hadHead = false
    this.hadPayload = false

    this.bytesTransformed = 0
    this.bytesToTransform = 0
  }

  _transform(chunk, charset, done) {
    if (!this.hadHead) {
      this._transformHead()
    }
    if (!this.hadPayload && this.hadHead) {
      this._transformPayload(chunk)
    }

    done()
  }

  _transformHead(chunk, charset) {
    var headLength, headMasking, headBase = Buffer.alloc(2)

    if (this.header.final || this.header.final === undefined) {
      headBase[0] |= FINAL
    }
    if (this.header.opcode === undefined) {
      headBase[0] |= OPCODE
    } else {
      headBase[0] |= this.header.opcode
    }
    if (this.header.masked) {
      if (!this.header.masking) {
        this.header.masking = randomBytes(4)
      }

      headBase[1] |= MASKED
      headMasking = this.header.masking
    }

    this.header.length = this.header.length || 0

    if (this.header.length < 0x7e) {
      headBase[1] |= this.header.length || 0x00
    }
    if (this.header.length >= 0x7e && this.header.length <= 0xffff) {
      headBase[1] |= LENGTH_EXT1
      headLength = Buffer.alloc(2)
      headLength.writeUInt16BE(this.header.length, 0)
    }
    if (this.header.length > 0xffff) {
      headBase[1] |= LENGTH_EXT2
      headLength = Buffer.alloc(8)
      headLength.writeUInt32BE(0x00, 0)
      headLength.writeUInt32BE(this.header.length, 4)
    }
    if (this.header.length > MAX_LENGTH) {
      this.emit('error', new Error('Payload length too big.'))

      return
    }

    this.hadHead = true

    if (headBase) this.push(headBase)
    if (headLength) this.push(headLength)
    if (headMasking) this.push(headMasking)

    this.bytesToTransform = this.header.length
  }

  _transformPayload(chunk, charset) {
    if (this.header.masked) {
      for (let i = 0; i < chunk.length; i++) {
        let j = i + this.bytesTransformed

        chunk[i] = chunk[i] ^ this.header.masking[j % 4]
      }
    }

    this.push(chunk.slice(0, this.bytesToTransform))

    this.bytesTransformed += chunk.length
    this.bytesToTransform -= chunk.length

    if (!this.bytesToTransform) {
      this.hadPayload = true
      this.push(null)
    }
  }

}

module.exports = Outgoing
