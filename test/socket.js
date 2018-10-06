const chai = require('chai')
const walve = require('../lib')
const stream = require('readable-stream')

describe('Socket', () => {

  var source, socket

  beforeEach(() => {
    source = new stream.PassThrough()
    socket = new walve.Socket(source)
  })

  describe('Event: "incoming"', () => {

    it('should be emitted with incoming', done => {
      socket.once('incoming', (incoming, outgoing) => {
        chai.expect(incoming).to.be.instanceOf(walve.Incoming)

        done()
      })
      source.write(Buffer.from([0x81, 0x05]))
    })

    it('should be emitted at single incoming', done => {
      socket.once('incoming', incoming => {
        var result = ''

        incoming.on('readable', () => {
          result += incoming.read().toString()
        })
        incoming.on('end', () => {
          chai.expect(result).to.equal('Hello')

          done()
        })
      })
      source.write(Buffer.from([0x81]))
      source.write(Buffer.from([0x05]))
      source.write(Buffer.from([0x48]))
      source.write(Buffer.from([0x65]))
      source.write(Buffer.from([0x6c]))
      source.write(Buffer.from([0x6c]))
      source.write(Buffer.from([0x6f]))
    })

    it('should be emitted at double incoming', done => {
      var reads = 0
      var ends = 0

      var fragments = []

      socket.on('incoming', incoming => {
        incoming.on('readable', () => {
          var fragment = incoming.read().toString()

          switch (reads) {
            case 0:
            chai.expect(fragment).to.equal('Hel')
            break
            case 1:
            chai.expect(fragment).to.equal('lo')
          }
          reads++

          fragments.push(fragment)
        })
        incoming.on('end', () => {
          chai.expect(fragments.join('')).to.equal('Hello')

          ends++

          if (ends == 2) done()
        })
      })
      source.write(Buffer.from([
        0x81, 0x03, 0x48, 0x65, 0x6c,
        0x81, 0x02, 0x6c, 0x6f
      ]))
    })

    it('should be emitted at delayed incoming', done => {
      socket.once('incoming', incoming => {
        var result = ''

        incoming.on('readable', () => {
          result += incoming.read().toString()
        })
        incoming.once('end', () => {
          chai.expect(result).to.equal('Hello')

          done()
        })
      })

      setTimeout(() => {
        source.write(Buffer.from([0x81, 0x05, 0x48]))
      }, 10)
      setTimeout(() => {
        source.write(Buffer.from([0x65, 0x6c, 0x6c, 0x6f]))
      }, 20)
    })

    it('should be emitted at delayed double incoming', done => {
      var counter = 0

      socket.on('incoming', incoming => {
        var result = ''

        incoming.once('readable', () => {
          result += incoming.read().toString()
        })
        incoming.once('end', () => {
          switch (counter) {
            case 0:
            chai.expect(result).to.equal('Hello')
            break
            case 1:
            chai.expect(result).to.equal('World')
            done()
          }

          counter++
        })
      })

      setTimeout(() => {
        source.write(Buffer.from([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]))
      }, 10)
      setTimeout(() => {
        source.write(Buffer.from([0x82, 0x05, 0x57, 0x6f, 0x72, 0x6c, 0x64]))
      }, 20)
    })

  })

  describe('Event: "error"', () => {

    it('should be emitted on unsupported opcode', done => {
      socket.on('error', err => {
        chai.expect(err).to.be.instanceOf(Error)

        done()
      })

      source.end(Buffer.from([0x84, 0x00]))
    })

  })

  describe('Event: "close"', () => {

    it('should be emitted on source "end"', done => {
      socket.on('close', () => done())
      source.end()
    })

    it('should be emitted on source "timeout"', done => {
      socket.on('close', () => done())
      source.emit('timeout')
    })

  })

})
