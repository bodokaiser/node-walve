var http      = require('http');
var websocket = require('../lib');

var server = new http.Server();

server.on('request', function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('Hello World\n');
    response.end();
});

server.listen(3000);

var wsocket = new websocket.Server();

wsocket.on('connect', function() {
    console.log('new socket connected');
});

wsocket.on('message', function(incoming, outgoing) {
    incoming.once('readable', function() {
        console.log('message readable', incoming.read().toString());
    });
    incoming.once('end', function() {
        console.log('message ended');
    });
});

wsocket.listen(server);
