const http  = require('http')
const walve = require('../../lib')

let server = http.createServer().listen(3000);

let wserver = walve.createServer(wsocket => {
  wsocket.on('incoming', incoming => {
    var outgoing = new walve.Outgoing({
      header: { length: incoming.header.length }
    })

    incoming.pipe(outgoing).pipe(wsocket, { end: false })
  });
}).listen(server)
