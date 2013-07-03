var http      = require('http');
var websocket = require('../lib');

var server = http.createServer(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('Hello World\n');
    response.end();
}).listen(3000);

var wserver = new websocket.Server();

wserver.on('connect', function() {
    console.log('new socket connected');
});

wserver.on('message', function(incoming, outgoing) {
    incoming.once('readable', function() {
        console.log('message readable', incoming.read().toString());
    });
    incoming.once('end', function() {
        console.log('message ended');
    });
});

wserver.listen(server);
