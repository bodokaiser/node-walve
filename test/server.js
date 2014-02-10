var chai      = require('chai');
var http      = require('http');
var stream    = require('stream');
var salvatore = require('../lib');

describe('Server', function() {

  var wsServer, httpServer;

  before(function() {
    httpServer = new http.Server().listen(3000);
  });

  beforeEach(function() {
    wsServer = new salvatore.Server();
  });

  describe('new Server([options])', function() {

  });

  describe('#listen(server)', function() {

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
        port: 3000
      }).end();

      wsServer.once('connect', function() {
        done();
      });
      wsServer.listen(httpServer);
    });

  });

  describe('Event: "error"', function() {

  });

  describe('Event: "end"', function() {

  });

});
