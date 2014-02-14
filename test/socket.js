var chai   = require('chai');
var stream = require('stream');
var wesos  = require('../lib');

describe('Socket', function() {

  var source, socket;

  beforeEach(function() {
    source = new stream.PassThrough();
    socket = new wesos.Socket(source);
  });

  describe('new Socket(socket)', function() {

  });

  describe('Event: "message"', function() {

    it('should be emitted with incoming', function(done) {
      socket.once('message', function(incoming) {
        chai.expect(incoming).to.be.instanceOf(wesos.Incoming);

        done();
      });
      source.write(new Buffer([0x81, 0x05]));
    });

    it('should be emitted at single incoming', function(done) {
      socket.once('message', function(incoming) {
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

      socket.on('message', function(incoming) {
        var result = '';

        incoming.on('readable', function() {
          result += incoming.read().toString();
        });
        incoming.on('end', function() {
          chai.expect(result).to.equal('Hello');

          if (counter) done();

          counter++;
        });
      });
      source.write(new Buffer([0x81, 0x05]));
      source.write(new Buffer('Hello'));
      source.write(new Buffer([0x81, 0x05]));
      source.write(new Buffer('Hello'));
    });

  });

  describe('Event: "close"', function() {

  });

  describe('Event: "error"', function() {

  });

  describe('Event: "ping"', function() {

  });

  describe('Event: "end"', function() {

  });

});
