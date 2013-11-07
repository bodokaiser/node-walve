var chai   = require('chai');
var stream = require('stream');

var lib    = require('../../../lib');

describe('Socket', function() {

    var socket, source;

    describe('new Socket(source, [options])', function() {

        it('should throw an error if source is not provided', function() {
            chai.expect(function() {
                new lib.Socket();
            }).to.throw(Error);
        });

        it('should bind the source to socket', function() {
            source = new stream.PassThrough();
            
            chai.expect(new lib.Socket(source))
                .to.have.property('source', source);
        });

    });

    beforeEach(function() {
        source = new stream.Duplex();

        // using pass through would cause the socket to catch our events
        source._read = function() {};
        source._write = function(chunk, encoding, done) {
            this.emit('data2', chunk);

            done();
        };

        socket = new lib.Socket(source);
    });

    describe('socket.ping([message])', function() {

        it('should write a ping frame to the source', function(done) {
            var buffer = [];

            source.on('data2', function(chunk) {
                buffer.push(chunk);

                if (buffer.length != 2) return;

                chai.expect(Buffer.concat(buffer))
                    .to.eql(new Buffer([0x89, 0x03, 0x48, 0x65, 0x79]));

                done();
            });
            
            socket.ping(new Buffer('Hey'));
        });

    });

    describe('socket.send([message])', function() {

        it('should write a text frame to source', function(done) {
            var buffer = [];
            
            source.on('data2', function(chunk) {
                buffer.push(chunk);

                if (buffer.length != 2) return;

                chai.expect(Buffer.concat(buffer))
                    .to.eql(new Buffer([0x81, 0x03, 0x48, 0x65, 0x79]));

                done();
            });

            socket.send('Hey');
        });

    });

    describe('socket.close([message])', function() {

        it('should write a close frame to source', function(done) {
            var buffer = [];
            
            source.on('data2', function(chunk) {
                buffer.push(chunk);

                if (buffer.length != 2) return;

                chai.expect(Buffer.concat(buffer))
                    .to.eql(new Buffer([0x88, 0x03, 0x48, 0x65, 0x79]));

                done();
            });

            socket.close('Hey');
        });

    });

    require('./events');

});
