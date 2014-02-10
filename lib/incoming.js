var util   = require('util');
var stream = require('stream');

function Incoming(headers) {
  stream.PassThrough.call(this);

  for (var key in headers)
    this[key] = headers[key];
}

util.inherits(Incoming, stream.PassThrough);

module.exports = Incoming;
