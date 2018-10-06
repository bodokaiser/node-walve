const chai = require('chai')
const walve = require('../lib')
const stream = require('readable-stream')

describe('Incoming', () => {

  var incoming

  beforeEach(() => {
    incoming = new walve.Incoming()
  })

  describe('Event: "header"', () => {

    it('should be emitted with final "true"', done => {
      incoming.once('header', header => {
        chai.expect(header.final).to.be.true

        done()
      })
      incoming.write(Buffer.from([0x80, 0x00]))
    })

    it('should be emitted with final "false"', done => {
      incoming.once('header', header => {
        chai.expect(header.final).to.be.false

        done()
      })
      incoming.write(Buffer.from([0x00, 0x00]))
    })

    it('should be emitted with masked "true"', done => {
      incoming.once('header', header => {
        chai.expect(header.masked).to.be.true

        done()
      })
      incoming.write(Buffer.from([0x00, 0x80]))
      incoming.write(Buffer.from([0x00, 0x00, 0x00, 0x00]))
    })

    it('should be emitted with masked "false"', done => {
      incoming.once('header', header => {
        chai.expect(header.masked).to.be.false

        done()
      })
      incoming.write(Buffer.from([0x00, 0x00]))
    })

    it('should be emitted with opcode 0x08', done => {
      incoming.once('header', header => {
        chai.expect(header.opcode).to.equal(0x08)

        done()
      })
      incoming.write(Buffer.from([0x88, 0x00]))
    })

    it('should be emitted with length 125', done => {
      incoming.once('header', header => {
        chai.expect(header.length).to.equal(125)

        done()
      })
      incoming.write(Buffer.from([0x00, 0x7d]))
    })

    it('should be emitted with length 126', done => {
      incoming.once('header', header => {
        chai.expect(header.length).to.equal(126)

        done()
      })
      incoming.write(Buffer.from([0x00, 0x7e, 0x00, 0x7e]))
    })

    it('should be emitted with length 127', done => {
      incoming.once('header', header => {
        chai.expect(header.length).to.equal(127)

        done()
      })
      incoming.write(Buffer.from([0x00, 0x7e, 0x00, 0x7f]))
    })

    it('should be emitted with length 65535', done => {
      incoming.once('header', header => {
        chai.expect(header.length).to.equal(65535)

        done()
      })
      incoming.write(Buffer.from([0x00, 0x7e, 0xff, 0xff]))
    })

    it('should be emitted with length 65536', done => {
      incoming.once('header', header => {
        chai.expect(header.length).to.equal(65536)

        done()
      })
      incoming.write(Buffer.from([0x00, 0x7f]))
      incoming.write(Buffer.from([0x00, 0x00, 0x00, 0x00]))
      incoming.write(Buffer.from([0x00, 0x01, 0x00, 0x00]))
    })

    it('should be emitted with length 4294967295', done => {
      incoming.once('header', header => {
        chai.expect(header.length).to.equal(4294967295)

        done()
      })
      incoming.write(Buffer.from([0x00, 0x7f]))
      incoming.write(Buffer.from([0x00, 0x00, 0x00, 0x00]))
      incoming.write(Buffer.from([0xff, 0xff, 0xff, 0xff]))
    })

    it('should be emitted with masking buffer', done => {
      incoming.once('header', header => {
        chai.expect(header.masking).to.eql(Buffer.from([1, 2, 3, 4]))

        done()
      })
      incoming.write(Buffer.from([0x00, 0x80]))
      incoming.write(Buffer.from([0x01, 0x02]))
      incoming.write(Buffer.from([0x03, 0x04]))
    })

  })

  describe('Event: "readable"', () => {

    it('should be emitted once', done => {
      incoming.once('readable', () => {
        chai.expect(incoming.read().toString()).to.equal('Hello')

        done()
      })
      incoming.write(Buffer.from([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]))
    })

    it('should be emitted multiple', done => {
      var result = ''

      incoming.on('readable', () => {
        result += incoming.read().toString()

        if (result.length === 5) {
          chai.expect(result).to.equal('Hello')

          done()
        }
      })
      incoming.write(Buffer.from([0x81]))
      incoming.write(Buffer.from([0x05]))
      incoming.write(Buffer.from([0x48]))
      incoming.write(Buffer.from([0x65]))
      incoming.write(Buffer.from([0x6c]))
      incoming.write(Buffer.from([0x6c]))
      incoming.write(Buffer.from([0x6f]))
    })

    it('should be emitted with unmasked data', done => {
      incoming.once('readable', () => {
        var result = incoming.read().toString()

        chai.expect(result).to.equal('Hello')

        done()
      })
      incoming.write(Buffer.from([0x81, 0x85]))
      incoming.write(Buffer.from([0x37, 0xfa]))
      incoming.write(Buffer.from([0x21, 0x3d]))
      incoming.write(Buffer.from([0x7f, 0x9f]))
      incoming.write(Buffer.from([0x4d, 0x51, 0x58]))
    })

  })

  describe('Event: "error"', () => {

    it('should emit error on RSV1', done => {
      incoming.once('error', err => {
        chai.expect(err).to.be.instanceOf(Error)

        done()
      })
      incoming.end(Buffer.from([0x40, 0x00]))
    })

    it('should emit error on RSV2', done => {
      incoming.once('error', err => {
        chai.expect(err).to.be.instanceOf(Error)

        done()
      })
      incoming.end(Buffer.from([0x20, 0x00]))
    })

    it('should emit error on RSV3', done => {
      incoming.once('error', err => {
        chai.expect(err).to.be.instanceOf(Error)

        done()
      })
      incoming.end(Buffer.from([0x10, 0x00]))
    })

    it('should emit error on length < 32UInt', done => {
      incoming.once('error', err => {
        chai.expect(err).to.be.instanceOf(Error)

        done()
      })
      incoming.write(Buffer.from([0x82, 0x7f]))
      incoming.write(Buffer.from([0x00, 0x00, 0x00, 0x01]))
      incoming.write(Buffer.from([0x00, 0x00, 0x00, 0x00]))
    })

  })

  describe('Event: "flush"', () => {

    it('should not be emitted', () => {
      incoming.once('flush', () => {
        throw new Error('Should not be emitted.')
      })
      incoming.write(Buffer.from([0x82, 0x00]))
    })

    it('should be emitted with chunk', done => {
      incoming.once('flush', chunk => {
        chai.expect(chunk).to.eql(Buffer.from([0x81, 0x02]))

        done()
      })
      incoming.write(Buffer.from([0x82, 0x00, 0x81, 0x02]))
    })

    it('should be emitted with chunk', done => {
      incoming.once('flush', chunk => {
        chai.expect(chunk).to.eql(Buffer.from([0x81]))

        done()
      })
      incoming.write(Buffer.from([0x82]))
      incoming.write(Buffer.from([0x01]))
      incoming.write(Buffer.from([0xff, 0x81]))
    })

  })

  describe('Event: "end"', () => {

    it('should be emitted on end of empty frame', done => {
      incoming.on('readable', () => {
        incoming.read()
      })
      incoming.once('end', done)
      incoming.write(Buffer.from([0x82, 0x00]))
    })

    it('should be emitted on end of empty advanced frame', done => {
      incoming.on('readable', () => {
        incoming.read()
      })
      incoming.once('end', done)
      incoming.write(Buffer.from([0x82, 0x80, 0x01, 0x02, 0x03, 0x04]))
    })

    it('should be emitted on end of advanced frame', done => {
      incoming.on('readable', () => {
        incoming.read()
      })
      incoming.once('end', done)
      incoming.write(Buffer.from([0x82, 0x81, 0x01, 0x02, 0x03, 0x04, 0x01]))
    })

    it('should be emitted on end of fragmented frame', done => {
      incoming.on('readable', () => {
        incoming.read()
      })
      incoming.once('end', done)
      incoming.write(Buffer.from([0x82]))
      incoming.write(Buffer.from([0x01]))
      incoming.write(Buffer.from([0x01]))
    })

  })

})
