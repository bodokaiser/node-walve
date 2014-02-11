var chai      = require('chai');
var stream    = require('stream');
var salvatore = require('../lib');

describe('Incoming', function() {

  var incoming;

  beforeEach(function() {
    incoming = new salvatore.Incoming();
  });

  describe('new Incoming()', function() {

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
