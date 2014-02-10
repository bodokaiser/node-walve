# salvatore

**salvatore** is a stream based WebSocket implementation for node.js.

    var salvatore = require('salvatore');

    // will broadcast all incoming messages to all sockets
    salvatore.createServer(function(wsocket, wserver) {
      wsocket.pipe(wserver);
    }).listen(server);

## Installation

The package is available on **npm** as **salvatore**.

    npm install --save salvatore

## Documentation

### Server

#### new Server()

#### Event: "connection"

#### Event: "close"

#### Event: "error"

#### server.listen(http)

### Socket

#### new Socket(socket)

#### Event: "connect"

#### Event: "message"

#### Event: "close"

#### Event: "end"

#### socket.write(data)

#### socket.close(data)

#### socket.end(data)

### Incoming

#### new Incoming()

### Outgoing

#### new Outgoing()

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
