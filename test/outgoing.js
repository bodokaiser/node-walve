var chai      = require('chai');
var stream    = require('stream');
var websocket = require('../lib');

describe('Outgoing', function() {

    var socket, outgoing;

    describe('new Outgoing([headers])', function() {

        it('should set default headers', function() {
            var outgoing = new websocket.Outgoing();

            chai.expect(outgoing).to.have.property('fin', true);
            chai.expect(outgoing).to.have.property('rsv1', false);
            chai.expect(outgoing).to.have.property('rsv2', false);
            chai.expect(outgoing).to.have.property('rsv3', false);
            chai.expect(outgoing).to.have.property('masked', false);
            chai.expect(outgoing).to.have.property('opcode', 0x01);
            chai.expect(outgoing).to.have.property('length', 0x00);
            chai.expect(outgoing).to.have.property('masking', null);
        });

        it('should overwrite default headers', function() {
            var outgoing = new websocket.Outgoing({
                fin: false, rsv1: true, rsv2: true, rsv3: true, masked: true,
                opcode: 0x08, length: 0x05, masking: new Buffer(4)
            });

            chai.expect(outgoing).to.have.property('fin', false);
            chai.expect(outgoing).to.have.property('rsv1', true);
            chai.expect(outgoing).to.have.property('rsv2', true);
            chai.expect(outgoing).to.have.property('rsv3', true);
            chai.expect(outgoing).to.have.property('masked', true);
            chai.expect(outgoing).to.have.property('opcode', 0x08);
            chai.expect(outgoing).to.have.property('length', 0x05);
            chai.expect(outgoing).to.have.property('masking');
        });

    });
 
    beforeEach(function() {
        socket   = new stream.PassThrough();
        outgoing = new websocket.Outgoing();
    });

    describe('outgoing.assignSocket(socket)', function() {

        it('should set source to socket', function() {
            outgoing.assignSocket(socket);

            chai.expect(outgoing).to.have.property('socket', socket);
        });

        it('should throw an error if no socket assigned', function() {
            chai.expect(function() {
                outgoing.write(new Buffer(1));
            }).to.throw(Error);
        });

    });

    describe('outgoing.writeHead([headers])', function() {

        it('should write defaults headers', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead();

            chai.expect(socket.read())
                .to.eql(new Buffer([0x81, 0x00]));
        });

        it('should write fin "false" header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ fin: false });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x01, 0x00]));
        });

        it('should write rsv1 "true" header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ rsv1: true });

            chai.expect(socket.read())
                .to.eql(new Buffer([0xc1, 0x00]));
        });

        it('should write rsv2 header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ rsv2: true });

            chai.expect(socket.read())
                .to.eql(new Buffer([0xa1, 0x00]));
        });

        it('should write rsv3 header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ rsv3: true });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x91, 0x00]));
        });

        it('should write opcode header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ opcode: 0x08 });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x88, 0x00]));
        });

        it('should write masked header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ masked: true });

            chai.expect(socket.read().slice(0, 2))
                .to.eql(new Buffer([0x81, 0x80]));
        });

        it('should write length "0x7d" header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ length: 0x7d });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x81, 0x7d]));
        });

        it('should write length "0x7e" header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ length: 0x7e });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x81, 0x7e, 0x00, 0x7e]));
        });

        it('should write length "0x7f" header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ length: 0x7f });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x81, 0x7e, 0x00, 0x7f]));
        });

        it('should write length "0xffff" header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ length: 0xffff });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x81, 0x7e, 0xff, 0xff]));
        });

        it('should write length "0x10000" header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ length: 0x10000 });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x81, 0x7f, 0x00, 0x00, 0x00, 0x00, 0x00, 
                        0x01, 0x00, 0x00]));
        });

        it('should write generated masking header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ masked: true });

            chai.expect(socket.read())
                .to.have.property('length', 6);
        });

        it('should write defined masking header', function() {
            outgoing.assignSocket(socket);

            outgoing.writeHead({ masked: true, 
                masking: new Buffer([0x01, 0x02, 0x03, 0x04]) });

            chai.expect(socket.read())
                .to.eql(new Buffer([0x81, 0x80, 0x01, 0x02, 0x03, 0x04]));
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
