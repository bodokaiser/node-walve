var util     = require('util');
var events   = require('events');
var wsparser = require('websocket-parser');
var incoming = require('./incoming');
var outgoing = require('./outgoing');

function Socket(source, options) {
    events.EventEmitter.call(this);
    
    bindSource(this, source);
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.ping = function() {

};

Socket.prototype.send = function() {

};

Socket.prototype.close = function() {

};

module.exports = Socket;

function bindSource(socket, source) {
    bindSourceToParser(socket, source);
    bindSourceToSocket(socket, source);
}

function bindSourceToParser(socket, source) {
    var incoming;
    
    var parser = new wsparser.Parser();
        
    parser.on('header', function(headers) {
        incoming = new Incoming(headers);

        handleIncoming(socket, source, incoming);
    });

    parser.on('readable', function() {
        incoming.write(parser.read());
    });

    parser.on('complete', function() {
        incoming.end();
    });

    source.on('close', function() {
        source.unpipe(parser);
        
        parser.removeAllListeners();
    });

    source.pipe(parser);
}

function bindSourceToSocket(socket, source) {
    socket.source = source;
}

function handleIncoming(socket, source, incoming) {
    switch (incoming.opcode) {
        case 0x08:
            source.end();
            socket.emit('close', incoming);
            break;
        case 0x09:
            var outgoing = new Outgoing();
            
            outgoing.opcode = 0x0a;
            outgoing.length = incoming.length;
            outgoing.assignSocket(source);

            incoming.pipe(outgoing);
            break;
        case 0x0a:
            socket.emit('pong', incoming);
            break;
        default:
            socket.emit('message', incoming);
            break;
    }
}
