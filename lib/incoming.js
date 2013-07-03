var util    = require('util');
var stream  = require('stream');

function WebSocketIncoming() {
    stream.PassThrough.call(this);
}

util.inherits(WebSocketIncoming, stream.PassThrough);

module.exports = WebSocketIncoming;
