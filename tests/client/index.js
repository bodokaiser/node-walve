var chai      = require('chai');
var http      = require('http');

var websocketx = require('../../library');

describe('Client', function() {

    var server, client;

    beforeEach(function() {
        server = new http.Server().listen(3000);
        client = new websocketx..Client('ws://localhost:3000');
    });

    afterEach(function() {
        if (client.socket) client.socket.close();

        server.close();
    });

    describe('Event: "open"', function() {

        it('should be emitted on valid upgrade response', function(done) {
            server.once('upgrade', function(request, socket) {
                var response = new websocketx..UpgradeResponse(request);

                response.assignSocket(socket);
                response.end();
            });

            client.once('open', function() {
                done();
            });

            client.open();
        });

    });

    describe('Event: "pong"', function() {

    });

    describe('Event: "message"', function() {

        it('should be emitted on text frame', function(done) {
            client.once('message', function(incoming) {
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
            
            server.once('upgrade', function(request, socket) {
                var response = new websocketx..UpgradeResponse(request);

                response.assignSocket(socket);
                response.end();

                socket.write(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
            });

            client.open();
        });

        it('should be emitted on binary frame', function(done) {
            client.once('message', function(incoming) {
                var buffer = [];
                    
                console.log(incoming.opcode);

                incoming.on('readable', function() {
                    buffer.push(incoming.read());
                });
                incoming.on('end', function() {
                    chai.expect(Buffer.concat(buffer))
                        .to.eql(new Buffer([0x01, 0x02, 0x03, 0x04]));

                    done();
                });
            });
            
            server.once('upgrade', function(request, socket) {
                var response = new websocketx.UpgradeResponse(request);

                response.assignSocket(socket);
                response.end();

                socket.write(new Buffer([0x82, 0x04, 0x01, 0x02, 0x03, 0x04]));
            });

            client.open();
        });
    
    });

    describe('Event: "close"', function() {

    }),

    describe('client.send(message)', function() {

        xit('should send a message to the server', function(done) {
            server.once('upgrade', function(request, socket) {
                var response = new websocketx.UpgradeResponse(request);

                response.assignSocket(socket);
                response.end();

                var buffer = [];
                socket.on('readable', function() {
                    buffer.push(socket.read());
                    console.log(buffer);
                    done();
                });
            });

            client.open(function() {
                client.send('Hello');
            });
        });

    });
    
    describe('client.close(message)', function() {

    });

});
