var util                = require('util');
var http                = require('http');
var events              = require('events');
var wshandshake         = require('websocket-handshake');
var WebSocketParser     = require('websocket-parser');
var WebSocketIncoming   = require('./incoming');

function WebSocketServer() {
    events.EventEmitter.call(this);
}

util.inherits(WebSocketServer, events.EventEmitter);

WebSocketServer.prototype.listen = function(server) {
    var self = this;
    
    server.on('upgrade', function(request, socket) {
        var error = handleUpgradeRequest(request, socket);

        if (error) return self.emit('error', error);

        handleWebSocketStream(self, socket);

        self.emit('connect');
    });

    return this;
};

module.exports = WebSocketServer;

function handleUpgradeRequest(request, socket, callback) {
    var error = wshandshake.validateWebSocketUpgradeRequest(request);

    if (error) {
        var response = http.ServerResponse(request);

        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.write('Invalid HTTP WebSocket upgrade request.\n');
        response.end();

        return error;
    }

    var response = new wshandshake.WebSocketUpgradeResponse(request);

    response.assignSocket(socket);
    response.end();

    return null;
}

function handleWebSocketStream(server, socket) {
    var wsparser = new WebSocketParser();

    var wsincoming;

    wsparser.on('begin', function() {
        wsincoming = new WebSocketIncoming();
    });

    wsparser.on('header', function(headers) {
        wsincoming.headers = headers;
        
        server.emit('message', wsincoming);
    });

    wsparser.on('readable', function() {
        wsincoming.write(wsparser.read());
    });

    wsparser.on('complete', function() {
        wsincoming.end();
    });

    socket.pipe(wsparser);
}
