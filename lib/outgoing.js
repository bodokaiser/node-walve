var util   = require('util');
var stream = require('stream');

function Outgoing() {

}

util.inherits(Outgoing, stream.Writable);

Outgoing.prototype.assignSocket = function(socket) {

};

module.exports = Outgoing;
