var util      = require('util');
var http      = require('http');
var events    = require('events');
var wsupgrade = require('websocket-upgrade');

function Server() {
    events.EventEmitter.call(this);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function(server) {
    var self = this;
    
    server.on('upgrade', function(request, socket) {
        var error = handleUpgrade(request, socket);

        if (error) return self.emit('error', error);
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
