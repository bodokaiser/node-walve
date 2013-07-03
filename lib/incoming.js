var util    = require('util');
var stream  = require('stream');

function WebSocketIncoming() {
    stream.Readable.call(this);
}

util.inherits(WebSocketIncoming, stream.Readable);

module.exports = WebSocketIncoming;
