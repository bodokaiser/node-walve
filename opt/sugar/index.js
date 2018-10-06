const fs   = require('fs')
const http = require('http')

const WSServer = require('./server')

let server = http.createServer((request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  })

  fs.createReadStream(__dirname + '/index.html').pipe(response)
}).listen(3000)

let wserver = new WSServer();

wserver.on('text', message => {
  wserver.broadcast(message)
})

wserver.listen(server)
