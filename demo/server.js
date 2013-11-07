var http = require('http');

var lib  = require('../lib');

var server = http.createServer(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('Hello World\n');
    response.end();
}).listen(3000);

var wsserver = lib.createServer(function(wsocket) {

    wsocket.on('message', function(incoming, outgoing) {
        var message = [];
        incoming.once('readable', function() {
            message.push(incoming.read());
        });
        incoming.once('end', function() {
            console.log('message', Buffer.concat(message).toString());
        });
    });

    wsocket.on('close', function() {
        console.log('close frame');
    });

    wsocket.on('end', function() {
        console.log('socket end');
    });

}).listen(server);
