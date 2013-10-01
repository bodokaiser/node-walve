var websocket = require('../lib');

var client = new websocket.Client('ws://echo.websocket.org');

client.on('open', function() {
    console.log('connection established');

    client.send(new Buffer('Hello'));
});

client.on('message', function(incoming) {
    var buffer = [];

    incoming.on('readable', function() {
        buffer.push(incoming.read());
    });
    incoming.on('end', function() {
        console.log('message', Buffer.concat(buffer).toString());
    });
});

client.on('close', function(incoming) {
    var buffer = [];

    incoming.on('readable', function() {
        buffer.push(incoming.read());
    });
    incoming.on('end', function() {
        console.log('connection closed', Buffer.concat(buffer).toString());
    });
});

client.on('error', function(error) {
    throw error;
});

client.open();
