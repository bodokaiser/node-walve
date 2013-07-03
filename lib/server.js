var util      = require('util');
var http      = require('http');
var events    = require('events');
var wsparser  = require('websocket-parser');
var wsupgrade = require('websocket-upgrade');

var Incoming  = require('./incoming');
var Outgoing  = require('./outgoing');

function Server() {
    events.EventEmitter.call(this);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function(server) {
    var self = this;
    
    server.on('upgrade', function(request, socket) {
        var error = handleUpgrade(request, socket);

        if (error) return self.emit('error', error);

        handleStream(self, socket);

        self.emit('open');
    });

    return this;
};

module.exports = Server;

function handleUpgrade(request, socket, callback) {
    var error = wsupgrade.validateUpgradeRequest(request);

    if (error) {
        var response = http.ServerResponse(request);

        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.write('Invalid HTTP WebSocket upgrade request.\n');
        response.end();

        return error;
    }

    var response = new wsupgrade.UpgradeResponse(request);

    response.assignSocket(socket);
    response.end();

    return null;
}

function handleStream(server, socket) {
    var parser = new wsparser.Parser();

    var incoming;

    parser.on('begin', function() {
        incoming = new Incoming();
    });

    parser.on('header', function(headers) {
        incoming.headers = headers;
        
        server.emit('message', incoming);
    });

    parser.on('readable', function() {
        incoming.write(parser.read());
    });

    parser.on('complete', function() {
        incoming.end();
    });

    socket.pipe(parser);
}
