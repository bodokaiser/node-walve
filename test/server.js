var chai      = require('chai');
var http      = require('http');
var events    = require('events');
var salvatore = require('../lib');

describe('Server', function() {

  describe('new Server([options])', function() {

    it('should return instance of EventEmitter', function() {
      var server = new salvatore.Server();

      chai.expect(server).to.be.an.instanceOf(events.EventEmitter);
    });

  });

  describe('#listen(server)', function() {

    it('should listen to the servers "upgrade" event', function() {
      var server = new http.Server();
      var wserver = new salvatore.Server();

      wserver.listen(server);

      chai.expect(server.listeners('upgrade')).to.have.length(1);
    });

  });

  describe('Event: "connect"', function() {

    var server, wserver;

    beforeEach(function() {
      server = new http.Server();
      wserver = new salvatore.Server();

      server.listen(3000);
      wserver.listen(server);
    });

    it('should be emitted on successful http upgrade', function(done) {
      http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        port: 3000
      }).end();

      wserver.once('connect', done);
    });

    afterEach(function() {
      server.close();
    });

  });

  describe('Event: "error"', function() {

  });

});
