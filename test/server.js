var chai = require('chai');
var http = require('http');

var lib    = require('../lib');

describe('Server', function() {

  var server, wserver;

  beforeEach(function() {
    server = new http.Server().listen(3000);
    wserver = new lib.Server().listen(server);
  });

  afterEach(function() {
    server.close();
  });

  describe('Event: "open"', function() {

    it('should be emitted when a new client connects', function(done) {
      wserver.once('open', function(wsocket) {
        chai.expect(wsocket).to.be.an.instanceof(lib.Socket);

        done();
      });

      new lib.UpgradeRequest('ws://localhost:3000').end();
    });

  });

  describe('Event: "pong"', function() {

    it('should be emitted when a pong frame is received', function(done) {
      wserver.once('pong', function(wsocket, incoming, outgoing) {
        chai.expect(wsocket).to.be.an.instanceof(lib.Socket);
        chai.expect(incoming).to.be.an.instanceof(lib.Incoming);
        chai.expect(outgoing).to.be.an.instanceof(lib.Outgoing);

        var buffer = [];
        incoming.on('readable', function() {
          buffer.push(incoming.read());
        });
        incoming.on('end', function() {
          chai.expect(Buffer.concat(buffer))
          .to.eql(new Buffer('Hey'));

          done();
        });
      });

      var req = new lib.UpgradeRequest('ws://localhost:3000');

      req.once('upgrade', function(response, socket) {
        socket.write(new Buffer([0x8a, 0x03, 0x48, 0x65, 0x79]));
      });

      req.end();
    });

  });

  describe('Event: "message"', function() {

    it('should be emitted when a text frame is received', function(done) {
      wserver.once('message', function(wsocket, incoming, outgoing) {
        chai.expect(wsocket).to.be.an.instanceof(lib.Socket);
        chai.expect(incoming).to.be.an.instanceof(lib.Incoming);
        chai.expect(outgoing).to.be.an.instanceof(lib.Outgoing);

        var buffer = [];
        incoming.on('readable', function() {
          buffer.push(incoming.read());
        });
        incoming.on('end', function() {
          chai.expect(Buffer.concat(buffer))
          .to.eql(new Buffer('Hello'));

          done();
        });
      });

      var req = new lib.UpgradeRequest('ws://localhost:3000');

      req.once('upgrade', function(response, socket) {
        socket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21]));
        socket.write(new Buffer([0x3d, 0x7f, 0x9f, 0x4d]));
        socket.write(new Buffer([0x51, 0x58]));
      });

      req.end();
    });

    it('should be emitted when a binary frame is received', function(done) {
      wserver.once('message', function(wsocket, incoming, outgoing) {
        chai.expect(wsocket).to.be.an.instanceof(lib.Socket);
        chai.expect(incoming).to.be.an.instanceof(lib.Incoming);
        chai.expect(outgoing).to.be.an.instanceof(lib.Outgoing);

        var buffer = [];
        incoming.on('readable', function() {
          buffer.push(incoming.read());
        });
        incoming.on('end', function() {
          chai.expect(Buffer.concat(buffer))
          .to.eql(new Buffer([0x01, 0x02, 0x03]));

          done();
        });
      });

      var req = new lib.UpgradeRequest('ws://localhost:3000');

      req.once('upgrade', function(response, socket) {
        socket.write(new Buffer([0x82, 0x03, 0x01, 0x02, 0x03]));
      });

      req.end();
    });

  });

  describe('Event: "close"', function() {

    it('should be emitted when a close frame is received', function(done) {
      wserver.once('close', function(wsocket, incoming) {
        chai.expect(wsocket).to.be.an.instanceof(lib.Socket);
        chai.expect(incoming).to.be.an.instanceof(lib.Incoming);

        var buffer = [];
        incoming.on('readable', function() {
          buffer.push(incoming.read());
        });
        incoming.on('end', function() {
          chai.expect(Buffer.concat(buffer))
          .to.eql(new Buffer([0x48, 0x65, 0x79]));

          done();
        });
      });

      var req = new lib.UpgradeRequest('ws://localhost:3000');

      req.once('upgrade', function(response, socket) {
        socket.write(new Buffer([0x88, 0x03, 0x48, 0x65, 0x79]));
      });

      req.end();
    });

  });

  describe('Event: "error"', function() {

  });

});
