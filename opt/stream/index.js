const fs = require('fs')
const path = require('path')
const http = require('http')
const walve = require('../../lib')

let server = http.createServer((request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  })

  fs.createReadStream(__dirname + '/index.html').pipe(response)
}).listen(3000)

let wserver = walve.createServer(wsocket => {
  var filestream = fs.createReadStream(__dirname + '/../../README.md');

  createOutgoing(wsocket, {
    final: false,
    opcode: 0x01
  }).end('')

  filestream.on('readable', () => {
    var chunk = filestream.read();

    if (!chunk) return

    createOutgoing(wsocket, {
      final: false,
      opcode: 0x00,
      length: chunk.length
    }).end(chunk)
  })
  filestream.on('end', () => {
    createOutgoing(wsocket, {
      final: true,
      opcode: 0x00
    }).end('')
  });

}).listen(server)

function createOutgoing(wsocket, header) {
  let outgoing = new walve.Outgoing()

  outgoing.header = header
  outgoing.pipe(wsocket, {
    end: false
  })

  return outgoing
}
