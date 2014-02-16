var util   = require('util');
var events = require('events');

var Socket   = require('./socket');
var Response = require('./response');

function Server(options) {
  options = options || {};

  this.url = options.url;

  events.EventEmitter.call(this, options);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function(server) {
  var self = this;

  server.on('upgrade', function(request, socket) {
    if (self.url && request.url !== self.url) return;

    var response = new Response(request);

    response.assignSocket(socket);
    response.end();

    self.emit('connect', new Socket(socket));
  });

  return this;
};

module.exports = Server;
