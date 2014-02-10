exports.Server = require('./server');

exports.createServer = function(listener) {
  var server = new exports.Server();

  return server.on('connect', listener);
};
