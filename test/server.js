var chai   = require('chai');
var http   = require('http');
var events = require('events');
var walve  = require('../lib');

const PORT = process.env.PORT || 3000;

describe('Server', function() {

  var server, wserver;

  beforeEach(function() {
    server = new http.Server().listen(PORT);
    wserver = new walve.Server().listen(server);
  });

  describe('new Server([options])', function() {

    it('should return instance of EventEmitter', function() {
      chai.expect(wserver).to.be.an.instanceOf(events.EventEmitter);
    });

  });

  describe('#listen(server)', function() {

    it('should listen to the servers "upgrade" event', function() {
      wserver = new walve.Server().listen(server);

      chai.expect(server.listeners('upgrade')).to.have.length(2);
    });

  });

  describe('Event: "connect"', function() {

    it('should be emitted on WebSocket connect', function(done) {
      var request = http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        port: PORT
      });
      request.once('upgrade', function(res, socket) {
        socket.write(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
      });
      request.end();

      wserver.once('connect', function(wsocket) {
        chai.expect(wsocket).to.be.an.instanceOf(walve.Socket);

        wsocket.once('message', function(incoming) {
          var result = '';

          incoming.on('readable', function() {
            result += incoming.read().toString();
          });
          incoming.on('end', function() {
            chai.expect(result).to.equal('Hey');

            done();
          });
        });
      });
    });

  });

  describe('Event: "error"', function() {

  });

  afterEach(function() {
    server.close();
  });

});
