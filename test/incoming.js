var chai   = require('chai');
var salv   = require('../lib');
var stream = require('stream');

describe('Incoming', function() {

  var incoming;

  beforeEach(function() {
    incoming = new salv.Incoming();
  });

  describe('new Incoming()', function() {

  });

  describe('Event: "header"', function() {

    it('should be emitted with final "true"', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.final).to.be.true;

        done();
      });
      incoming.write(new Buffer([0x80, 0x00]));
    });

    it('should be emitted with final "false"', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.final).to.be.false;

        done();
      });
      incoming.write(new Buffer([0x00, 0x00]));
    });

    it('should be emitted with masked "true"', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.masked).to.be.true;

        done();
      });
      incoming.write(new Buffer([0x00, 0x80]));
      incoming.write(new Buffer([0x00, 0x00, 0x00, 0x00]));
    });

    it('should be emitted with masked "false"', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.masked).to.be.false;

        done();
      });
      incoming.write(new Buffer([0x00, 0x00]));
    });

    it('should be emitted with opcode 0x08', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.opcode).to.equal(0x08);

        done();
      });
      incoming.write(new Buffer([0x88, 0x00]));
    });

    it('should be emitted with length 125', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.length).to.equal(125);

        done();
      });
      incoming.write(new Buffer([0x00, 0x7d]));
    });

    it('should be emitted with length 126', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.length).to.equal(126);

        done();
      });
      incoming.write(new Buffer([0x00, 0x7e, 0x00, 0x7e]));
    });

    it('should be emitted with length 127', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.length).to.equal(127);

        done();
      });
      incoming.write(new Buffer([0x00, 0x7e, 0x00, 0x7f]));
    });

    it('should be emitted with length 65535', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.length).to.equal(65535);

        done();
      });
      incoming.write(new Buffer([0x00, 0x7e, 0xff, 0xff]));
    });

    it('should be emitted with length 65536', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.length).to.equal(65536);

        done();
      });
      incoming.write(new Buffer([0x00, 0x7f]));
      incoming.write(new Buffer([0x00, 0x00, 0x00, 0x00]));
      incoming.write(new Buffer([0x00, 0x01, 0x00, 0x00]));
    });

    it('should be emitted with length 4294967295', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.length).to.equal(4294967295);

        done();
      });
      incoming.write(new Buffer([0x00, 0x7f]));
      incoming.write(new Buffer([0x00, 0x00, 0x00, 0x00]));
      incoming.write(new Buffer([0xff, 0xff, 0xff, 0xff]));
    });

    it('should be emitted with masking buffer', function(done) {
      incoming.once('header', function(header) {
        chai.expect(header.masking).to.eql(new Buffer([1, 2, 3, 4]));

        done();
      });
      incoming.write(new Buffer([0x00, 0x80]));
      incoming.write(new Buffer([0x01, 0x02]));
      incoming.write(new Buffer([0x03, 0x04]));
    });

  });

  describe('Event: "readable"', function() {

    it('should be emitted once', function(done) {
      incoming.once('readable', function() {
        var result = incoming.read().toString();

        chai.expect(result).to.equal('Hello');

        done();
      });
      incoming.write(new Buffer([0x81, 0x05]));
      incoming.write(new Buffer('Hello'));
    });

    it('should be emitted twice', function(done) {
      incoming.once('readable', function() {
        var result1 = incoming.read().toString();

        incoming.once('readable', function() {
          var result2 = incoming.read().toString();

          chai.expect(result1 + result2).to.equal('HelloWorld');

          done();
        });
      });
      incoming.write(new Buffer([0x81, 0x0a]));
      incoming.write(new Buffer('Hello'));
      incoming.write(new Buffer('World'));
    });

    it('should be emitted with unmasked data', function(done) {
      incoming.once('readable', function() {
        var result = incoming.read().toString();

        incoming.once('readable', function() {
          result += incoming.read().toString();

          chai.expect(result).to.equal('Hello');

          done();
        });
      });
      incoming.write(new Buffer([0x81, 0x85]));
      incoming.write(new Buffer([0x37, 0xfa]));
      incoming.write(new Buffer([0x21, 0x3d]));
      incoming.write(new Buffer([0x7f, 0x9f]));
      incoming.write(new Buffer([0x4d, 0x51, 0x58]));
    });

  });

  describe('Event: "error"', function() {

    it('should emit error on RSV1', function(done) {
      incoming.once('error', function(err) {
        chai.expect(err).to.be.instanceOf(Error);

        done();
      });
      incoming.end(new Buffer([0x40, 0x00]));
    });

    it('should emit error on RSV2', function(done) {
      incoming.once('error', function(err) {
        chai.expect(err).to.be.instanceOf(Error);

        done();
      });
      incoming.end(new Buffer([0x20, 0x00]));
    });

    it('should emit error on RSV3', function(done) {
      incoming.once('error', function(err) {
        chai.expect(err).to.be.instanceOf(Error);

        done();
      });
      incoming.end(new Buffer([0x10, 0x00]));
    });

    it('should emit error on length < 32UInt', function(done) {
      incoming.once('error', function(err) {
        chai.expect(err).to.be.instanceOf(Error);

        done();
      });
      incoming.write(new Buffer([0x82, 0x7f]));
      incoming.write(new Buffer([0x00, 0x00, 0x00, 0x01]));
      incoming.write(new Buffer([0x00, 0x00, 0x00, 0x00]));
    });

  });

  describe('Event: "end"', function() {

    it('should be emitted on no payload', function(done) {
      incoming.on('readable', function() {
        incoming.read();
      });
      incoming.once('end', done);
      incoming.write(new Buffer([0x81, 0x00]));
    });

    it('should be emitted on payload end', function(done) {
      incoming.on('readable', function() {
        incoming.read();
      });
      incoming.once('end', done);
      incoming.write(new Buffer([0x81, 0x05]));
      incoming.write(new Buffer('World'));
    });

  });

});
