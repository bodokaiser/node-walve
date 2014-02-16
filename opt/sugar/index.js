var fs   = require('fs');
var http = require('http');

var Server = require('./server');

var server = http.createServer(function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  fs.createReadStream(__dirname + '/index.html').pipe(response);
}).listen(3000);

var wserver = new Server();

wserver.on('text', function(message) {
  wserver.broadcast(message);
});

wserver.listen(server);
