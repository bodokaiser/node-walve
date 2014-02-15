# wesos

**wesos** is a stream based WebSocket implementation for node.js.

    var wesos = require('wesos');

    // will broadcast all incoming messages to all sockets
    wesos.createServer(function(wsocket, wserver) {
      wsocket.pipe(wserver);
    }).listen(server);

## Installation

The package is available on **npm** as **wesos**.

    npm install --save wesos

## Documentation

### Server

#### new Server()

Listens on the "upgrade" event of a http server and handles connected
WebSockets.

#### Event: "open"

Emitted when a new WebSocket upgrade was established.

#### Event: "close"

Emitted when the server closes.

#### Event: "error"

Emitted when an error occurs.

#### server.listen(http)

Listens on the "upgrade" event of the `http` instance.

### Socket

Abstracts a single WebSocket connection.

#### new Socket(socket)

Creates a new `Socket` which abstracts a tcp `socket` supplied by the
http "upgrade" event.

#### Event: "message"

Emitted when a WebSocket frame is received.

#### Event: "close"

Emitted when a WebSocket close frame is received.

#### Event: "ping"

Emitted when a WebSocket ping frame is received.

#### Event: "end"

Emitted when the underlaying socket ends.

### Incoming

Abstracts an incoming WebSocket frame (stream).

#### new Incoming()

#### Event: "readable"

#### Event: "end"

### Outgoing

Abstracts an outgoing WebSocket frame (stream).

#### new Outgoing(socket)

Creates a new instance of `Outgoing` bound to `socket`.

#### outgoing.write(data)

Writes data to a WebSocket. Except you directly use `outgoing.end()` the
written data will be sent as fragmented frame. This is the only way to
have a true stream like approach else we always would require the
complete payload length.

#### outgoing.end([data])

Ends a fragmented frame stream.

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
