var chai      = require('chai');
var stream    = require('stream');
var websocket = require('../lib');

describe('Socket', function() {

    var socket, source;

    describe('new Socket(source, [options])', function() {

        it('should throw an error if source is not provided', function() {
            chai.expect(function() {
                new websocket.Socket();
            }).to.throw(Error);
        });

        it('should bind the source to socket', function() {
            source = new stream.PassThrough();
            
            chai.expect(new websocket.Socket(source))
                .to.have.property('source', source);
        });

    });

    beforeEach(function() {
        source = new stream.PassThrough();
        socket = new websocket.Socket(source);
    });

    describe('socket.ping([message])', function() {

        xit('should write a ping frame to the source', function(done) {
            var buffer = [];
            source.on('readable', function() {
                buffer.push(source.read());
            });
            source.on('end', function() {
                console.log(buffer);
            });
            
            socket.ping();
            source.end();
        });

    });

    describe('socket.send([message])', function() {

    });

    describe('socket.close([message])', function() {

    });

    describe('Event: "pong"', function() {

        it('should be emitted on a pong frame', function(done) {
            socket.once('pong', function(incoming, outgoing) {
                var buffer = [];

                incoming.on('readable', function() {
                    buffer.push(incoming.read());
                });
                incoming.on('end', function() {
                    chai.expect(Buffer.concat(buffer))
                        .to.eql(new Buffer([0x01, 0x02]));

                    done();
                });
            });

            source.write(new Buffer([0x8a, 0x02, 0x01, 0x02]));
        });

    });

    describe('Event: "message"', function() {

        it('should be emitted on a text frame', function(done) {
            socket.once('message', function(incoming, outgoing) {
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

            source.write(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));
        });

        it('should be emitted on a binary frame', function(done) {
            socket.once('message', function(incoming, outgoing) {
                var buffer = [];

                incoming.on('readable', function() {
                    buffer.push(incoming.read());
                });
                incoming.on('end', function() {
                    chai.expect(Buffer.concat(buffer))
                        .to.eql(new Buffer([0x01, 0x02, 0x03]));

                    done();
                });
            });

            source.write(new Buffer([0x81, 0x03, 0x01, 0x02, 0x03]));
        });
    
    });

    describe('Event: "error"', function() {

    });

    describe('Event: "close"', function() {

        it('should be emitted on a close frame', function(done) {
            socket.once('close', function(incoming) {
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

            source.write(new Buffer([0x88, 0x03, 0x48, 0x65, 0x79]));
        });

        it('should be emitted when source closes', function(done) {
            socket.once('close', function() {
                done();
            });

            source.end();
        });

    });

});
