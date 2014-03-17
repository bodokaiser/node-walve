var http  = require('http');
var walve = require('../../lib');

var server = http.createServer().listen(3000);

var wserver = walve.createServer(function(wsocket) {
  wsocket.on('incoming', function(incoming) {
    var outgoing = new walve.Outgoing({
      header: { length: incoming.header.length }
    });

    incoming.pipe(outgoing).pipe(wsocket, { end: false });
  });
}).listen(server);
