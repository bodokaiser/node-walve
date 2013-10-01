var wsparser  = require('websocket-parser');
var wsupgrade = require('websocket-upgrade');

exports.Client   = require('./client');
exports.Server   = require('./server');
exports.Socket   = require('./socket');
exports.Incoming = require('./incoming');
exports.Outgoing = require('./outgoing');

exports.Parser = wsparser.Parser;

exports.UpgradeRequest  = wsupgrade.UpgradeRequest;
exports.UpgradeResponse = wsupgrade.UpgradeResponse;

exports.validateUpgradeRequest  = wsupgrade.validateUpgradeRequest;
exports.validateUpgradeResponse = wsupgrade.validateUpgradeResponse;

exports.createServer = function(listener) {
    return new exports.Server(listener);
};
