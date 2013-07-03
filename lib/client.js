var util = require('util');
var http = require('http');

function Client() {

}

util.inherits(Client, http.ClientRequest);

Client.prototype.open = function() {

};

Client.prototype.close = function() {

};

module.exports = Client;
