var chai      = require('chai');
var http      = require('http');
var websocket = require('../lib');

describe('Client', function() {

    var server, client;

    beforeEach(function() {
        server = new http.Server().listen(3000);
        client = new websocket.Client('ws://localhost:3000');
    });

    afterEach(function() {
        server.close();
    });

    describe('Event: "open"', function() {

    });

    describe('Event: "pong"', function() {

    });

    describe('Event: "message"', function() {

    });

    describe('Event: "close"', function() {

    }),

    describe('client.send(message)', function() {

        it('should send a message to the server', function(done) {
            server.once('upgrade', function(request, socket) {
                var response = websocket.UpgradeResponse(request);

                response.assignSocket(socket);
                response.end();

                var buffer = [];
                socket.on('readable', function() {
                    buffer.push(socket.read());
                });
                socket.on('end', function() {
                    chai.expect(Buffer.concat(buffer))
                        .to.have.property('length', 11);

                    done();
                });
            });

            client.open(function() {
                client.send('Hello');
                client.socket.end();
            });
        });

    });
    
    describe('client.close(message)', function() {

    });

});
