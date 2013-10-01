var chai      = require('chai');
var stream    = require('stream');

var websocketx = require('../../library');

describe('Socket', function() {

    beforeEach(function() {
        source = new stream.PassThrough();
        socket = new websocketx.Socket(source);
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
            socket.on('close', function(incoming) {
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

    });

    describe('Event: "end"', function() {

        it('should be emitted when source closes', function(done) {
            socket.once('end', function() {
                done();
            });

            source.end();
        });

    });

});
