var chai      = require('chai');
var stream    = require('stream');
var salvatore = require('../lib');

describe('Incoming', function() {

  var incoming;

  describe('new Incoming()', function() {

  });

  describe('Event: "readable"', function() {

    beforeEach(function() {
      incoming = new salvatore.Incoming();
    });

    it('should be emitted with "Hello"', function(done) {
      incoming.once('readable', function() {
        var result = incoming.read().toString();

        chai.expect(result).to.equal('Hello');
      });
      incoming.write(new Buffer([0x81, 0x05]));
      incoming.write(new Buffer('Hello'));
    });

  });

  describe('Event: "end"', function() {

    beforeEach(function() {
      incoming = new salvatore.Incoming();
    });

    xit('should be emitted on payload end', function(done) {
      incoming.once('end', done);

      incoming.write(new Buffer([0x81, 0x00]));
    });

  });

});
