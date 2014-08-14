var chai   = require('chai');
var stream = require('stream');
var walve  = require('../lib');

describe('Outgoing', function() {

  var outgoing;

  beforeEach(function() {
    outgoing = new walve.Outgoing();
  });

  describe('new Outgoing()', function() {

    it('should return instance of Transform', function() {
      chai.expect(outgoing).to.be.an.instanceOf(stream.Transform);
    });

  });

  describe('Event: "readable"', function() {

    it('should transform "true" final header', function(done) {
      outgoing.header.final = true;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[0]).to.equal(0x81);

        done();
      });
      outgoing.write('');
    });

    it('should transform "false" final header', function(done) {
      outgoing.header.final = false;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[0]).to.equal(0x01);

        done();
      });
      outgoing.write('');
    });

    it('should transform "true" masked header', function(done) {
      outgoing.header.masked = true;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x80);

        done();
      });
      outgoing.write('');
    });

    it('should transform "false" masked header', function(done) {
      outgoing.header.masked = false;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x00);

        done();
      });
      outgoing.write('');
    });

    it('should transform "0x08" opcode header', function(done) {
      outgoing.header.opcode = 0x08;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[0]).to.equal(0x88);

        done();
      });
      outgoing.write('');
    });

    it('should transform "0x7d" length header', function(done) {
      outgoing.header.length = 0x7d;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x7d);

        done();
      });
      outgoing.write('');
    });

    it('should transform "0x7e" length header', function(done) {
      outgoing.header.length = 0x7e;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x7e);

        outgoing.once('readable', function() {
          chai.expect(outgoing.read().readUInt16BE(0)).to.equal(0x7e);

          done();
        });
      });
      outgoing.write('');
    });

    it('should transform "0x7f" length header', function(done) {
      outgoing.header.length = 0x7f;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x7e);

        outgoing.once('readable', function() {
          chai.expect(outgoing.read().readUInt16BE(0)).to.equal(0x7f);

          done();
        });
      });
      outgoing.write('');
    });

    it('should transform "0xffff" length header', function(done) {
      outgoing.header.length = 0xffff;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x7e);

        outgoing.once('readable', function() {
          chai.expect(outgoing.read().readUInt16BE(0)).to.equal(0xffff);

          done();
        });
      });
      outgoing.write('');
    });

    it('should transform "0x10000" length header', function(done) {
      outgoing.header.length = 0x10000;

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x7f);

        outgoing.once('readable', function() {
          chai.expect(outgoing.read().readUInt32BE(4)).to.equal(0x10000);

          done();
        });
      });
      outgoing.write('');
    });

    it('should transform "buffer" masking header', function(done) {
      outgoing.header.masked = true;
      outgoing.header.masking = new Buffer([0x01, 0x02, 0x03, 0x04]);

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x80);

        outgoing.once('readable', function() {
          chai.expect(outgoing.read()).to.equal(outgoing.header.masking);

          done();
        });
      });
      outgoing.write('');
    });

    it('should transform "buffer" masking header randomly', function(done) {
      outgoing.header.masked = true;
      outgoing.header.length = 0x05,

      outgoing.once('readable', function() {
        chai.expect(outgoing.read()[1]).to.equal(0x85);

        outgoing.once('readable', function() {
          chai.expect(outgoing.read()).to.have.length(4);

          done();
        });
      });
      outgoing.write('hello');
    });

  });

  describe('Event: "end"', function() {

    it('should be emitted on end of empty frame', function(done) {
      outgoing.header.final = true;
      outgoing.header.opcode = 0x01;
      outgoing.header.length = 0x00;

      var result = [];
      outgoing.on('readable', function() {
        result.push(outgoing.read());
      });
      outgoing.on('end', function() {
        chai.expect(Buffer.concat(result)).to.eql(new Buffer([0x81, 0x00]));

        done();
      });
      outgoing.write('');
    });

    it('should be emitted on end of frame payload', function(done) {
      outgoing.header.final = true;
      outgoing.header.opcode = 0x01;
      outgoing.header.length = 0x05;

      var result = [];
      outgoing.on('readable', function() {
        result.push(outgoing.read());
      });
      outgoing.on('end', function() {
        result = Buffer.concat(result);

        chai.expect(result.slice(0, 2)).to.eql(new Buffer([0x81, 0x05]));
        chai.expect(result.slice(2).toString()).to.eql('Hello');

        done();
      });
      outgoing.write('Hello');
    });

  });

});
