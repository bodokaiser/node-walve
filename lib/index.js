exports.Server   = require('./server');
exports.Socket   = require('./socket');
exports.Incoming = require('./incoming');
exports.Outgoing = require('./outgoing');

exports.createServer = function(listener, options) {
    return new exports.Server(listener, options);
};
