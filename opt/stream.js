var fs    = require('fs');
var path  = require('path');
var http  = require('http');
var walve = require('../lib');

var filename = path.join(__dirname, '../README.md');

var server = http.createServer(function(request, response) {
  var html = '<DOCTYPE html>'
    + '<html>'
      + '<body>'
        + '<h1>Hello</h1>'
        + '<p id="content"></p>'
        + '<script>'
          + 'var ws = new WebSocket(\'ws://localhost:3000\');\n'
          + 'ws.onmessage = function(e) {'
            + 'document.getElementById(\'content\').innerText += e.data;'
          + '};\n'
        + '</script>'
      + '</body>'
    + '</html>';

  response.writeHead(200, {
    'Content-Type': 'text/html'
  });
  response.write(html);
  response.end();
}).listen(3000);

var wserver = walve.createServer(function(wsocket) {

  var filestream = fs.createReadStream(filename);

  createOutgoing(wsocket, {
    final: false,
    opcode: 0x01
  }).end('');

  filestream.on('readable', function() {
    var chunk = filestream.read();

    createOutgoing(wsocket, {
      final: false,
      opcode: 0x00,
      length: chunk.length
    }).end(chunk);
  });

  filestream.on('end', function() {
    createOutgoing(wsocket, {
      final: true,
      opcode: 0x00
    }).end('');
  });

}).listen(server);

function createOutgoing(wsocket, header) {
  var outgoing =  new walve.Outgoing();

  outgoing.header = header;
  outgoing.pipe(wsocket, { end: false });

  return outgoing;
}
