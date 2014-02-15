exports.Server = require('./server');
exports.Socket = require('./socket');
exports.Incoming = require('./incoming');
exports.Response = require('./response');

exports.createServer = function(listener) {
  var server = new exports.Server();

  return server.on('connect', listener);
};
