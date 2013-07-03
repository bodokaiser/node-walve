var util   = require('util');
var stream = require('stream');

function Incoming() {
    stream.PassThrough.call(this);
}

util.inherits(Incoming, stream.PassThrough);

module.exports = Incoming;
