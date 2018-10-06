const chai = require('chai')
const walve = require('../lib')
const stream = require('readable-stream')

describe('Outgoing', () => {

  var outgoing

  beforeEach(() => {
    outgoing = new walve.Outgoing()
  })

  describe('new Outgoing()', () => {

    it('should return instance of Transform', () => {
      chai.expect(outgoing).to.be.an.instanceOf(stream.Transform)
    })

  })

  describe('Event: "readable"', () => {

    it('should transform "true" final header', done => {
      outgoing.header.final = true

      outgoing.once('readable', () => {
        chai.expect(outgoing.read()[0]).to.equal(0x81)

        done()
      })
      outgoing.write('')
    })

    it('should transform "false" final header', done => {
      outgoing.header.final = false

      outgoing.once('readable', () => {
        chai.expect(outgoing.read()[0]).to.equal(0x01)

        done()
      })
      outgoing.write('')
    })

    it('should transform "true" masked header', done => {
      outgoing.header.masked = true

      outgoing.once('readable', () => {
        chai.expect(outgoing.read()[1]).to.equal(0x80)

        done()
      })
      outgoing.write('')
    })

    it('should transform "false" masked header', done => {
      outgoing.header.masked = false

      outgoing.once('readable', () => {
        chai.expect(outgoing.read()[1]).to.equal(0x00)

        done()
      })
      outgoing.write('')
    })

    it('should transform "0x08" opcode header', done => {
      outgoing.header.opcode = 0x08

      outgoing.once('readable', () => {
        chai.expect(outgoing.read()[0]).to.equal(0x88)

        done()
      })
      outgoing.write('')
    })

    it('should transform "0x7d" length header', done => {
      outgoing.header.length = 0x7d

      outgoing.once('readable', () => {
        chai.expect(outgoing.read()[1]).to.equal(0x7d)

        done()
      })
      outgoing.write('')
    })

    it('should transform "0x7e" length header', done => {
      outgoing.header.length = 0x7e

      outgoing.once('readable', () => {
        chai.expect(outgoing.read().slice(1))
          .to.eql(Buffer.from([0x7e, 0x00, 0x7e]))

        done()
      })
      outgoing.write('')
    })

    it('should transform "0x7f" length header', done => {
      outgoing.header.length = 0x7f

      outgoing.once('readable', () => {
        chai.expect(outgoing.read().slice(1))
          .to.eql(Buffer.from([0x7e, 0x00, 0x7f]))

        done()
      })
      outgoing.write('')
    })

    it('should transform "0xffff" length header', done => {
      outgoing.header.length = 0xffff

      outgoing.once('readable', () => {
        chai.expect(outgoing.read().slice(1))
          .to.eql(Buffer.from([0x7e, 0xff, 0xff]))

        done()
      })
      outgoing.write('')
    })

    it('should transform "0x10000" length header', done => {
      outgoing.header.length = 0x10000

      outgoing.once('readable', () => {
        chai.expect(outgoing.read().slice(1))
          .to.eql(Buffer.from([
            0x7f, 0x00, 0x00, 0x00, 0x00,
                  0x00, 0x01, 0x00, 0x00]))

        done()
      })
      outgoing.write('')
    })

    it('should transform "buffer" masking header', done => {
      outgoing.header.masked = true
      outgoing.header.masking = Buffer.from([0x01, 0x02, 0x03, 0x04])

      outgoing.once('readable', () => {
        let buffer = outgoing.read()

        chai.expect(buffer.slice(0, 2)).to.eql(Buffer.from([0x81, 0x80]))
        chai.expect(buffer.slice(2)).to.eql(outgoing.header.masking)

        done()
      })
      outgoing.write('')
    })

    it('should transform "buffer" masking header randomly', done => {
      outgoing.header.masked = true
      outgoing.header.length = 0x05,

        outgoing.once('readable', () => {
          let buffer = outgoing.read()

          chai.expect(buffer).to.have.length(2+4+5)
          chai.expect(buffer.slice(0, 2)).to.eql(Buffer.from([0x81, 0x85]))
          chai.expect(buffer.slice(6)).to.not.eql(Buffer.from('hello'))

          done()
        })
      outgoing.write('hello')
    })

  })

  describe('Event: "end"', () => {

    it('should be emitted on end of empty frame', done => {
      outgoing.header.final = true
      outgoing.header.opcode = 0x01
      outgoing.header.length = 0x00

      var result = []
      outgoing.on('readable', () => {
        result.push(outgoing.read())
      })
      outgoing.on('end', () => {
        chai.expect(Buffer.concat(result)).to.eql(Buffer.from([0x81, 0x00]))

        done()
      })
      outgoing.write('')
    })

    it('should be emitted on end of frame payload', done => {
      outgoing.header.final = true
      outgoing.header.opcode = 0x01
      outgoing.header.length = 0x05

      var result = []
      outgoing.on('readable', () => {
        result.push(outgoing.read())
      })
      outgoing.on('end', () => {
        result = Buffer.concat(result.filter(buffer => !!buffer))

        chai.expect(result.slice(0, 2)).to.eql(Buffer.from([0x81, 0x05]))
        chai.expect(result.slice(2).toString()).to.eql('Hello')

        done()
      })
      outgoing.write('Hello')
    })

  })

})
