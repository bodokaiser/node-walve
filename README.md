# salvatore

**salvatore** is a stream based WebSocket implementation for node.js.

    var salvatore = require('salvatore');

    salvatore.createServer(function(wsocket, wserver) {

      wsocket.on('message', function(incoming, outgoing) {
        incoming.pipe(wserver);
      });


    }).listen(server);

## Installation

The package is available on **npm** as **salvatore**.

    npm install --save salvatore

## Documentation

### Class: Incoming

`websocket.Incoming` extends `stream.PassThrough` in order to represent an
incoming WebSocket frame. All head information are available on the incoming
object (e.g. `incoming.opcode`).

#### Event: "readable"

    var buffer = [];

    incoming.on('readable', function() {
        buffer.push(incoming.read());
    });
    incoming.on('end', function() {
        console.log(Buffer.concat(buffer));
    });

Emitted when chunk is available to read. If you need to work with the frames
payload data at once you can buffer all chunk until a `end` is emitted. See
the above example.

### Class: Outgoing

`websocket.Outgoing` extends `stream.Writable` in order to represent an 
outgoing WebSocket frame.

#### new Outgoing([headers])

    var outgoing = new Outgoing({
        opcode: 0x08, length: 0x03, masked: true
    });

Creates a new instance of `Outgoing`.

#### outgoing.assignSocket(socket)

    server.on('upgrade', function(request, socket) {
        // respond WebSocket handshake

        var outgoing = new Outgoing();

        outgoing.assignSocket(socket);

        // now we can use the outgoing
    });

Assign an instance of `net.Socket` to it. This is required in order to write
data to it. If `outgoing` was emitted with an event it has already an assigned
Socket.

#### outgoing.writeHead([headers])

    outgoing.writeHead({
        fin: false, opcode: 0x2, length: 0x05
    });

Writes a frame head to socket. Overwrites frame head with `headers` if present
else uses the already defined defaults. This method must be called before
writting the payload.

#### outgoing.write(chunk)

    outgoing.write(new Buffer('Hello'));

Writes payload to the frame. Does auto masking if `outgoing.masked` is `true`.
Throws an error when payload length exceeds header length.

#### outgoing.end([chunk])

Similar to `outgoing.write(chunk)` except it ends a frame.

### Class: Socket

`websocket.Socket` is a wrapper around `net.Socket` which ability to read and
write WebSocket frames. It is uses from `Client` and `Server` as underlaying 
API.

#### wsocket.send([message])

    wsocket.send(new Buffer('Hello World'));

Sends a text frame with `Hello World` as payload.

#### wsocket.ping([message])

    wsocket.ping();

Sends a ping frame through the socket.

#### wsocket.close([message])

    wsocket.close();

Sends a close frame and closes the socket.

#### Event: "message"

Emitted when a message is received. Incoming and Outgoing streams are passed.

#### Event: "close"

Emitted when a close frame is received. Passes the close frame as incoming
stream to callback.

#### Event: "end"

Emitted when socket is closed by one of the sides.

### Class: Server

`websocket.Server` extends `events.EventEmitter` to be used as WebSocket server.

#### new Server([listener], [options])

    var wserver = new websocketx.Server();

Creates a new instance of `Server`. If first parameter is a function this will
be used as listener for the "open" Event.

#### Event: "open"

    wserver.on('open', function(wsocket, wserver) {
        wsocket.send(new Buffer('Hello'));
    });

Emitted when a new client has connected.

#### Event: "pong"

    wserver.on('ping', function(wsocket, incoming, outgoing) {
        incoming.pipe(fs.createWriteStream('ping.log'));
    });

Emitted when a pong frame is received.

#### Event: "message"

    wserver.on('message', function(wsocket, incoming, outgoing) {
        incoming.pipe(outgoing);
    });

Emitted when a text or binary frame is received.

#### Event: "close"

    wserver.on('close', function(wsocket, incoming) {
        if (incoming.length == 0x00) return;

        incoming.pipe(fs.createWriteStream('reasons.log'));
    });

Emitted when a close frame is received. `incoming` may contain a close reason.

#### Event: "end"

#### Event: "error"

    wserver.on('error', function(error) {
        console.log(error);
    }),

Emitted when an error occurs (e.g. invalid upgrade request).

#### wserver.broadcast(message)

    wserver.on('message', function(wsocket, incoming) {
        var buffer = [];
        
        incoming.on('readable', function() {
            buffer.push(incoming.read());
        });
        incoming.on('end', function() {
            wserver.broadcast(Buffer.concat(buffer));
        });
    });

#### wserver.listen(server)

    var server = new http.Server().listen(3000);

    wserver.listen(server);

Binds instance of `Server` to a HTTP servers `upgrade` event in order to handle
WebSocket handshakes and incoming frames.

## License

Copyright 2014 Bodo Kaiser <i@bodokaiser.io>

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
