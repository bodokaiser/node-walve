const {
  Writable
} = require('readable-stream')
const process = require('process')

const Incoming = require('./incoming')
const Outgoing = require('./outgoing')


class Socket extends Writable {

  constructor(source, options) {
    super(options)

    this._cache = []
    this._source = source
    this._incoming = this._intercept()

    source.on('readable', () => {
      let chunk = source.read()
      if (chunk) {
        this._cache.push(chunk)
        this._process()
      }
    })
    source.once('timeout', () => {
      let outgoing = new Outgoing({
        header: { opcode: 0x08 }
      })

      outgoing.pipe(source)
      outgoing.end('')
    })
    source.once('end', () => {
      this.emit('close')
    })
  }

  _write(chunk, charset, done) {
    this._source.write(chunk)

    done()
  }

  _read() {
    let chunk = Buffer.concat(this._cache)
    this._cache = []

    return chunk
  }

  _process() {
    let chunk = this._read()

    this._incoming.write(chunk)
  }

  _intercept() {
    var incoming = new Incoming()

    incoming.once('header', header => {
      if (isValidOpcode(header.opcode)) {
        this.emit('incoming', incoming)
      } else {
        this.emit('error', new Error(`Invalid opcode ${header.opcode}.`))
      }
    })
    incoming.once('flush', chunk => {
      this._cache.push(chunk)
      this._incoming = this._intercept()

      // this ensures that glued frames are readable in FIFO order
      process.nextTick(() => {
        this._process()
      })
    })

    return incoming
  }

}

module.exports = Socket

function isValidOpcode(opcode) {
  if (opcode < 0x03) return true
  if (opcode > 0x07 && opcode < 0x0b) return true

  return false
}
