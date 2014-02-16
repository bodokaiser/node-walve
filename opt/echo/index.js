var fs    = require('fs');
var http  = require('http');
var walve = require('../../lib');

var server = http.createServer(function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  fs.createReadStream(__dirname + '/index.html').pipe(response);
}).listen(3000);

var wserver = walve.createServer(function(wsocket) {
  wsocket.on('message', function(incoming, outgoing) {
    incoming.once('header', function(header) {
      outgoing.header.length = header.length;

      incoming.pipe(outgoing);
      outgoing.pipe(wsocket, { end: false });
    });
  });
}).listen(server);
