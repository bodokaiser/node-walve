var chai      = require('chai');
var stream    = require('stream');
var websocket = require('../lib');

describe('Outgoing', function() {

    var socket, outgoing;

    describe('new Outgoing([headers])', function() {

        it('should set default headers', function() {

        });

        it('should overwrite default headers', function() {

        });

    });
 
    beforeEach(function() {
        socket   = new stream.PassThrough();
        outgoing = new websocket.Outgoing();
    });

    describe('outgoing.assignSocket(socket)', function() {

        it('should set source to socket', function() {

        });

        it('should throw an error if no socket assigned', function() {

        });

    });

    describe('outgoing.writeHead([headers])', function() {

        it('should write defaults headers', function() {

        });

        it('should write fin header', function() {

        });

        it('should write rsv1 header', function() {

        });

        it('should write rsv2 header', function() {

        });

        it('should write rsv3 header', function() {

        });

        it('should write opcode header', function() {

        });

        it('should write masked header', function() {

        });

        it('should write length header', function() {

        });

        it('should write masking header', function() {

        });

    });

    describe('outgoing.write(chunk)', function() {

        it('should throw error if exceeds length', function() {

        });

        it('should write unmasked payload', function() {

        });

        it('should write masked payload', function() {

        });

    });

});
