var util   = require('util');
var stream = require('stream');
var crypto = require('crypto');

function Outgoing(headers) {
    stream.Writable.call(this);

    this.fin = true;
    this.rsv1 = false;
    this.rsv2 = false;
    this.rsv3 = false;
    this.masked = false;

    this.opcode = 0x01;
    this.length = 0x00;

    this.masking = null;

    overwriteHeaders(this, headers);

    this.socket = null;

    this.sendingHeaders = false;
    this.sentHeaders = false;

    this.bytesWritten = 0;
}

util.inherits(Outgoing, stream.Writable);

Outgoing.prototype._write = function(chunk, encoding, done) {
    if (!this.socket) 
        throw new Error('You must assign a socket before write.');

    if (this.sendingHeaders) {
        this.socket.write(chunk);
        
        return done();
    }   

    if (!this.sentHeaders)
        throw new Error('You must write the frame head before.');

    if (this.masked && this.masking.length == 4)
        chunk = maskChunk(this.masking, chunk, this.bytesWritten);

    this.bytesWritten += chunk.length;

    this.socket.write(chunk);

    done();
};

Outgoing.prototype.writeHead = function(headers) {
    if (this.sentHeaders)
        throw new Error('You cannot rewrite a sent head.');
    
    overwriteHeaders(this, headers);
    
    this.sendingHeaders = true;
    
    writeFirstByte(this, headers);
    writeSecondByte(this, headers);
    writeAdditionalBytes(this, headers);
    
    this.sendingHeaders = false;
    this.sentHeaders = true;

    return this;
};

Outgoing.prototype.assignSocket = function(socket) {
    this.socket = socket;

    return this;
};

module.exports = Outgoing;

function overwriteHeaders(source, headers) {
    for (var key in headers)
        source[key] = headers[key];

    return source;
}

function writeFirstByte(outgoing, headers) {
    var header = new Buffer(1);

    header.fill(0);

    if (headers.fin)
        header[0] |= 0x80;

    if (headers.rsv1)
        header[0] |= 0x40;

    if (headers.rsv2)
        header[0] |= 0x20;

    if (headers.rsv3)
        header[0] |= 0x10;

    if (headers.opcode)
        headers[0] |= opcode;

    outgoing.write(header);
}

function createSecondByte(outgoing, headers) {
    var header = new Buffer(1);

    header.fill(0);

    if (headers.masked)
        header[0] |= 0x80;

    if (headers.length < 0x7e)
        header[0] |= headers.length;
    if (headers.length > 0x7d && headers.length < 0x10000)
        header[0] |= 0x7e;
    if (headers.length > 0xffff)
        header[0] |= 0x7f;

    outgoing.write(header);
}

function writeAdditionalBytes(outgoing, headers) {
    var buffer = [];

    if (headers.length > 0x7d && headers.length < 0x10000) {
        var lengthBytes = new Buffer(2);

        lengthBytes.writeUInt16BE(0, headers.length);
    }
    if (headers.length > 0xffff) {
        var lengthBytes = new Buffer(8);

        lengthBytes.fill(0);
        lengthBytes.writeUInt32BE(4, headers.length); 
    }

    if (headers.masked) {
        if (headers.masking && headers.masking.length == 4) {
            var maskingBytes = headers.masking;
        } else {
            var maskingBytes = generateMasking();
        }
    }

    if (lengthBytes) buffer.push(lengthBytes);
    if (maskingBytes) buffer.push(maskingBytes);

    var bytes = Buffer.concat(buffer);

    if (bytes) outgoing.write(bytes);
}

function maskChunk(masking, chunk, offset) {
    for (var i = 0; i < chunk.length; i++)
        chunk[i] = chunk[i] ^ masking[(i + offset) % 4];

    return chunk;
}

function generateMasking() {
    return crypto.randomBytes(4);
}
