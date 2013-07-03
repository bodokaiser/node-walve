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

    describe('Event: "open"', function() {

        it('should be emitted when a new client connects', function(done) {
            wsserver.once('open', function() {
                done();       
            });
            
            new UpgradeRequest('ws://localhost:3000').end();
        });

    });

    describe('Event: "message"', function() {

        it('should be emitted when a message receives', function(done) {
            wsserver.once('message', function(incoming) {
                incoming.once('readable', function() {
                    chai.expect(incoming.read().toString()).to.equal('Hello');

                    done();
                });
            });
            
            var request = new UpgradeRequest('ws://localhost:3000');
            
            request.once('upgrade', function(response, socket) {
                socket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d]));
                socket.write(new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]));
            });

           request.end();
        });

    });

    describe('Event: "close"', function() {

    });

    afterEach(function() {
        httpserver.removeAllListeners();
        httpserver.close();
    }); 

});
