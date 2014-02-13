var chai   = require('chai');
var salv   = require('../lib');
var stream = require('stream');

describe('Socket', function() {

  var source, socket;

  beforeEach(function() {
    source = new stream.PassThrough();
    socket = new salv.Socket(source);
  });

  describe('new Socket(socket)', function() {

  });

  describe('Event: "message"', function() {

    it('should be emitted once on single incoming', function(done) {
      socket.once('message', function(incoming) {
        chai.expect(incoming).to.be.instanceOf(salv.Incoming);

        var result = '';
        incoming.on('readable', function() {
          result += incoming.read().toString();
        });
        incoming.on('end', function() {
          chai.expect(result).to.equal('Hello');

          done();
        });
      });
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
