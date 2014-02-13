var chai   = require('chai');
var http   = require('http');
var salv   = require('../lib');
var events = require('events');

const PORT = process.env.PORT || 3000;

describe('Server', function() {

  var server, wserver;

  beforeEach(function() {
    server = new http.Server().listen(PORT);
    wserver = new salv.Server().listen(server);
  });

  describe('new Server([options])', function() {

    it('should return instance of EventEmitter', function() {
      chai.expect(wserver).to.be.an.instanceOf(events.EventEmitter);
    });

  });

  describe('#listen(server)', function() {

    it('should listen to the servers "upgrade" event', function() {
      wserver = new salv.Server().listen(server);

      chai.expect(server.listeners('upgrade')).to.have.length(2);
    });

  });

  describe('Event: "connect"', function() {

    it('should be emitted on successful http upgrade', function(done) {
      http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        port: PORT
      }).end();

      wserver.once('connect', done);
    });

  });

  describe('Event: "error"', function() {

  });

  afterEach(function() {
    server.close();
  });

});
