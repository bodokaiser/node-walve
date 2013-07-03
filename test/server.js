var chai      = require('chai');
var http      = require('http');
var websocket = require('../lib');

var HttpServer      = http.Server;
var WebSocketServer = websocket.Server;

var UpgradeRequest  = websocket.UpgradeRequest;

describe('WebSocketServer', function() {

    var wsserver, httpserver;

    beforeEach(function() {
        wsserver    = new WebSocketServer();      
        httpserver  = new HttpServer();

        wsserver.listen(httpserver);
        httpserver.listen(3000);
    });

    describe('Event: "connect"', function() {

        it('should be emitted when a new client connects', function(done) {
            wsserver.once('connect', function() {
                done();       
            });
            
            new UpgradeRequest('ws://localhost:3000').end();
        });

    });

    describe('Event: "message"', function() {

    });

    describe('Event: "disconnect"', function() {

    });

    afterEach(function() {
        httpserver.removeAllListeners();
        httpserver.close();
    }); 

});
