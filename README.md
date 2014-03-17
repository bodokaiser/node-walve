# node-walve

**walve** is a stream based WebSocket implementation for node.js.

    var walve = require('walve');

    walve.createServer(function(wsocket) {
      wsocket.on('incoming', function(incoming) {
        // handle readable incoming stream
      });
    }).listen(server);

## Examples

You can find working examples in the `/opt` directory of this project.

- **echo**: echos messages back to the browser
- **sugar**: extends `Server` with some api sugar
- **stream**: streams file through websocket to document
- **cluster**: streams file through websocket cluster (hot concurrency)

Furthermore there are currently two real world examples using walve.
Feel free to add own projects:

- [nearby](https://github.com/bodokaiser/nearby) real time geolocation
  tracking with walve and google maps
- [messenger](https://github.com/bodokaiser/messenger) real time
  messenger with support for image streaming

## Installation

The package is available on **npm** as **walve**.

    npm install --save walve

## Documentation

### Server

#### new Server([options])

Creates a new `Server` instance. Valid `options` are for example `url`
which can be used to have multiple websocket servers on one http server.

#### Event: "connect"

Emitted when a new WebSocket upgrade was established. Provides instance
of `Socket` as argument.

#### Event: "error"

Emitted when an error occurs. For example on failed upgrade.

#### server.listen(http)

Listens on the "upgrade" event of the `http` instance.

### Socket

Abstracts a single WebSocket connection.

#### new Socket(socket)

Creates a new duplex stream `Socket` which reads and writes from the
underlaying TCP socket.

#### Event: "incoming"

    wsocket.on('incoming', function(incoming) {
      incoming.pipe(process.stdout, { end: false });
    });

Emitted when a WebSocket frame is received. First argument is a an
instance of `Incoming`.

#### Event: "end"

Emitted when the TCP connection closes.

### Incoming

Abstracts an incoming WebSocket frame.

#### new Incoming()

Creates a new instance of the `Incoming` transform stream. Which
transforms incoming WebSocket frames to node buffers.

#### incoming.header

    if (incoming.header.opcode === 0x01) {
        // handle data as unicode
    }

Contains `fin`, `opcode`, `length` and so on. You will mainly
be interested in `header.opcode` as the other values are more for
internal use.

#### Event: "readable"

    var message = '';

    incoming.on('readable', function() {
      message += incoming.read().toString();
    });

Emitted when there is payload to read from the frame.

#### Event: "end"

    incoming.on('end', function() {
      // log prev buffered messages
      console.log(message);
    });

Emitted when frame ends **and** data was consumed with
`incoming.read()`.

### Outgoing

Abstracts an outgoing WebSocket frame.

#### new Outgoing([options])

Returns a new instance of `Outgoing` transform stream. As this is a
transform and not a writable stream you must pipe `outgoing` to the
websocket `socket` provided by the server "connect" event. Options
can contain a `header` object. See below for more.

#### outgoing.header

    outgoing.header.final = true;
    outgoing.header.masked = false;
    outgoing.header.opcode = 0x01;
    outgoing.header.length = 0x0a;

    outgoing.write('Hello World').pipe(wsocket, { end: false });

Sets the header information of an outgoing frame. You can omit `final`
and `opcode` as they will use most common default values `true` and
`0x01` (text frame).

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
