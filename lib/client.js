var util      = require('util');
var http      = require('http');
var events    = require('events');
var wsupgrade = require('websocket-upgrade');
var Socket    = require('./socket');

function Client(url, options) {
    this.url = url;

    this.socket = null;
}

util.inherits(Client, events.EventEmitter);

Client.prototype.open = function() {
    var self = this;

    var request = new wsupgrade.UpgradeRequest(this.url);

    request.once('upgrade', function(response, socket) {
        var error = wsupgrade.validateUpgradeResponse(response, {
            key: this._headers['sec-websocket-key']
        });

        if (error) self.emit('error', error);

        handleStream(self, socket);
    });

    request.end();

    return this;
};

Client.prototype.ping = function(message) {
    this.socket.ping(message);

    return this;
};

Client.prototype.send = function(message) {
    this.socket.send(message);

    return this;
};

Client.prototype.close = function() {
    this.socket.close();

    return this;
};

module.exports = Client;

function handleStream(client, socket) {
    var wsocket = new Socket(socket, { masked: true });

    wsocket.on('pong', function(incoming, outgoing) {
        client.emit('pong', incoming, outgoing);
    });
    
    wsocket.on('close', function(incoming, outgoing) {
        client.emit('close', incoming);
    });

    wsocket.on('message', function(incoming, outgoing) {
        client.emit('message', incoming, outgoing);
    });

    wsocket.on('error', function(error) {
        client.emit('error', error);
    });

    client.socket = wsocket;

    client.emit('open');
}
