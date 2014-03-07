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
      chai.expect(server.listeners('upgrade')).to.have.length(1);
    });

    it('should listen on url specific upgrades', function(done) {
      wserver.url = '/images';

      var req1 = http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        path: '/', port: PORT
      });
      req1.once('upgrade', function() {
        throw new Error('Should not upgrade!');
      });
      req1.end();

      var req2 = http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        path: '/images', port: PORT
      });
      req2.once('upgrade', function() {
        done();
      });
      req2.end();
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

        wsocket.once('incoming', function(incoming) {
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
