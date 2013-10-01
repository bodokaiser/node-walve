var http      = require('http');
var websocket = require('../lib');

var server = http.createServer(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('Hello World\n');
    response.end();
}).listen(3000);

var wserver = new websocket.Server();

wserver.on('open', function(wsocket) {
    console.log('open');
    
    wsocket.send(new Buffer('Hello'));
});

wserver.on('message', function(wsocket, incoming, outgoing) {
    var message = [];
    incoming.once('readable', function() {
        message.push(incoming.read());
    });
    incoming.once('end', function() {
        console.log('message', Buffer.concat(message).toString());
    });
});

wserver.listen(server);
