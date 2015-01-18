var chai   = require('chai');
var walve  = require('../lib');
var stream = require('readable-stream');

describe('Socket', function() {

  var source, socket;

  beforeEach(function() {
    source = new stream.PassThrough();
    socket = new walve.Socket(source);
  });

  describe('new Socket(socket)', function() {

  });

  describe('Event: "incoming"', function() {

    it('should be emitted with incoming', function(done) {
      socket.once('incoming', function(incoming, outgoing) {
        chai.expect(incoming).to.be.instanceOf(walve.Incoming);

        done();
      });
      source.write(new Buffer([0x81, 0x05]));
    });

    it('should be emitted at single incoming', function(done) {
      socket.once('incoming', function(incoming) {
        var result = '';

        incoming.on('readable', function() {
          result += incoming.read().toString();
        });
        incoming.on('end', function() {
          chai.expect(result).to.equal('Hello');

          done();
        });
      });
      source.write(new Buffer([0x81]));
      source.write(new Buffer([0x05]));
      source.write(new Buffer([0x48]));
      source.write(new Buffer([0x65]));
      source.write(new Buffer([0x6c]));
      source.write(new Buffer([0x6c]));
      source.write(new Buffer([0x6f]));
    });

    it('should be emitted at double incoming', function(done) {
      var counter = 0;

      socket.on('incoming', function(incoming) {
        var result = '';

        incoming.on('readable', function() {
          result += incoming.read().toString();
        });
        incoming.on('end', function() {
          if (counter === 0) {
            chai.expect(result).to.equal('Hello');
          }
          if (counter === 1) {
            chai.expect(result).to.equal('World');

            done();
          }

          counter++;
        });
      });

      source.write(new Buffer([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]));
      source.write(new Buffer([0x82, 0x05, 0x57, 0x6f, 0x72, 0x6c, 0x64]));
    });

  });

  describe('Event: "error"', function() {

    it('should be emitted on unsupported opcode', function(done) {
      socket.on('error', function(err) {
        chai.expect(err).to.be.instanceOf(Error);

        done();
      });

      source.end(new Buffer([0x84, 0x00]));
    });

  });

  describe('Event: "ping"', function() {

  });

  describe('Event: "close"', function() {

    it('should be emitted on source "end"', function(done) {
      socket.on('close', function() {
        done();
      });

      source.end();
    });

    it('should be emitted on source "timeout"', function(done) {
      socket.on('close', function() {
        done();
      });

      source.emit('timeout');
    });

  });

  describe('Event: "end"', function() {

    it('should be emitted on close frame', function(done) {
      socket.on('readable', function() {
        socket.read();
      });
      socket.on('end', function() {
        done();
      });

      source.end(new Buffer([0x88, 0x00]));
    });

    it('should be emitted on source "end"', function(done) {
      socket.on('readable', function() {
        socket.read();
      });
      socket.on('end', function() {
        done();
      });

      source.end();
    });

    it('should be emitted on source "timeout"', function(done) {
      socket.on('readable', function() {
        socket.read();
      });
      socket.on('end', function() {
        done();
      });

      source.emit('timeout');
    });

    it('should stop emitting "readable"', function(done) {
      socket.on('readable', function() {
        throw new Error('Should not be emitted.');
      });
      socket.on('end', done).end();

      chai.expect(function() {
        source.push(new Buffer([0x81, 0x01, 0x48]));
      }).to.throw;
    });

  });

});
