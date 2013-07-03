# node-websocket-x

**node-websocket-x** is a stream based implementation of the WebSocket 
*RFC6455* protocol for node.js which tries to follow official node semantics.

## Preview

    var websocket = require('websocket-x');

    var server = http.createServer(function(request, response) {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Hello World\n');    
    });

    server.listen(3000);

    var wserver = new websocket.Server();

    wserver.on('open', function(outgoing) {
        outgoing.opcode = 0x01;

        outgoing.end('Hi!');
    });

    wserver.on('message', function(incoming, outgoing) {
        incoming.pipe(outgoing);
    });

    wserver.listen(server);

## Installation

The package is available on **npm** as **websocket-x**.

    npm install websocket-x

## Documentation

### Class: Server

#### new Server()

#### Event: "open"

#### Event: "ping"

#### Event: "pong"

#### Event: "message"

#### Event: "close"

#### wserver.listen(server)

#### wserver.close()

### Class: Client

#### new Client()

#### Event: "open"

#### Event: "ping"

#### Event: "pong"

#### Event: "message"

#### Event: "close"

#### wclient.close()

## License

Copyright 2013 Bodo Kaiser <i@bodokaiser.io>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
