var http  = require('http');
var walve = require('../lib');

var server = http.createServer(function(request, response) {
  var html = '<DOCTYPE html>'
    + '<html>'
      + '<body>'
        + '<h1>Hello</h1>'
        + '<script>'
          + 'var ws = new WebSocket("ws://localhost:3000");\n'
          + 'ws.onopen = function(e) { ws.send("Hello Bodo"); }\n'
          + 'ws.onmessage = function(e) { alert(e.data); };\n'
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

  wsocket.on('message', function(incoming, outgoing) {
    incoming.once('header', function(header) {
      outgoing.header.length = header.length;

      incoming.pipe(outgoing);
      outgoing.pipe(wsocket, { end: false });
    });
  });

}).listen(server);
