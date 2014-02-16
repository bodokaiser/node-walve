var fs    = require('fs');
var path  = require('path');
var http  = require('http');
var walve = require('../../lib');

var server = http.createServer(function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  fs.createReadStream(__dirname + '/index.html').pipe(response);
}).listen(3000);

var wserver = walve.createServer(function(wsocket) {

  var filestream = fs.createReadStream(__dirname + '/../../README.md');

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
