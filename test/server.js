var chai      = require('chai');
var http      = require('http');
var websocket = require('../lib');

describe('Server', function() {

    var server, wserver;

    beforeEach(function() {
        server  = new http.Server().listen(3000);
        wserver = new websocket.Server().listen(server);      
    });

    describe('Event: "open"', function() {

        it('should be emitted when a new client connects', function(done) {
            wserver.once('open', function() {
                done();       
            });
            
            new websocket.UpgradeRequest('ws://localhost:3000').end();
        });

    });

    describe('Event: "ping"', function() {

    });

    describe('Event: "pong"', function() {

    });

    describe('Event: "error"', function() {

    });

    describe('Event: "message"', function() {

        it('should be emitted when a message receives', function(done) {
            wserver.once('message', function(incoming) {
                incoming.once('readable', function() {
                    chai.expect(incoming.read().toString()).to.equal('Hello');

                    done();
                });
            });
            
            var request = new websocket.UpgradeRequest('ws://localhost:3000');
            
            request.once('upgrade', function(response, socket) {
                socket.write(new Buffer([0x81, 0x85, 0x37, 0xfa, 0x21, 0x3d]));
                socket.write(new Buffer([0x7f, 0x9f, 0x4d, 0x51, 0x58]));
            });

           request.end();
        });

    });

    xdescribe('Event: "close"', function() {

        it('should be emitted when close frame is received', function(done) {
            wserver.once('close', function(incoming) {
                incoming.once('readable', function() {
                    chai.expect(incoming.read().toString()).to.equal('Hello');

                    done();
                });
            });

            openWebSocket('ws://localhost:3000', function(socket) {
                socket.write(new Buffer([0x88, 0x00]));
            });
        });

    });

    afterEach(function() {
        server.removeAllListeners().close();
    }); 

});

function openWebSocket(url, callback) {
    var request = new websocket.UpgradeRequest(url);

    request.once('upgrade', function(response, socket) {
        callback(socket);
    });

    request.end();
}
