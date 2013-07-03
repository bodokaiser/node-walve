var util   = require('util');
var stream = require('stream');
var crypto = require('crypto');

function Outgoing() {
    this.headers = {};
 
    this.headers.fin    = true;
    this.headers.rsv1   = false;
    this.headers.rsv2   = false;
    this.headers.rsv3   = false;
    this.headers.masked = false;

    this.headers.opcode = 0x01;
    this.headers.length = 0x00;

    this.socket = null;
}

util.inherits(Outgoing, stream.Writable);

Outgoing.prototype._write = function(chunk, encoding, done) {
    if (!this.socket) 
        throw new Error('You must assign a socket before write.');

    

    done();
};

Outgoing.prototype.writeHead = function(headers) {
    merge(this.headers, headers);


};

Outgoing.prototype.assignSocket = function(socket) {
    this.socket = socket;

    return this;
};

module.exports = Outgoing;

function merge(source, dest) {
    for (var key in dest)
        source[key] = dest[key];

    return source;
}

function generateMasking() {
    return crypto.randomBytes(4);
}
