var util     = require('util');
var events   = require('events');
var wsparser = require('websocket-parser');
var Incoming = require('./incoming');
var Outgoing = require('./outgoing');

function Socket(source, options) {
    events.EventEmitter.call(this);
    
    this.masked = false;

    for (var key in options)
        this[key] = options[key];

    bindSource(this, source);
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.ping = function(message) {
    var outgoing = new Outgoing({ opcode: 0x09 });
    
    if (message && message.length)
        outgoing.length = message.length;

    outgoing.assignSocket(this.source);
    outgoing.writeHead({ masking: this.masking });
    
    if (message && message.length)
        outgoing.end(message);
    else
        outgoing.end();

    return this;
};

Socket.prototype.send = function(message) {
    var outgoing = new Outgoing({ opcode: 0x01 });
    
    if (message && message.length) {
        outgoing.length = message.length;
    }

    outgoing.assignSocket(this.source);

    outgoing.writeHead({ masking: this.masking });
    outgoing.write(message);
    outgoing.end();

    return this;
};

Socket.prototype.close = function(message) {
    var outgoing = new Outgoing({ opcode: 0x08 });
    
    if (message && message.length) {
        outgoing.length = message.length;
    }

    outgoing.assignSocket(this.source);

    outgoing.writeHead({ masking: this.masking });
    outgoing.write(message);
    outgoing.end();

    return this;
};

module.exports = Socket;

function bindSource(socket, source) {
    if (!source) throw new Error('You must pass a source to Socket.');

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

    source.on('end', function() {
        source.unpipe(parser);
        
        parser.removeAllListeners();

        socket.emit('close');
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
            var outgoing = new Outgoing({ 
                opcode: 0x0a, length: incoming.length 
            });
            
            outgoing.assignSocket(source);

            incoming.pipe(outgoing);
            break;
        case 0x0a:
            var outgoing = new Outgoing().assignSocket(source);

            socket.emit('pong', incoming, outgoing);
            break;
        default:
            var outgoing = new Outgoing().assignSocket(source);
            
            socket.emit('message', incoming, outgoing);
            break;
    }
}
