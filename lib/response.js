const {
  ServerResponse
} = require('http')
const {
  createHash
} = require('crypto')

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'


class Response extends ServerResponse {

  constructor(request) {
    super(request)

    let accept = generateAccept(request)

    this.statusCode = 101
    this.setHeader('Upgrade', 'websocket')
    this.setHeader('Connection', 'Upgrade')
    this.setHeader('Sec-WebSocket-Accept', accept)
    this.setHeader('Sec-WebSocket-Version', '13')
  }

}

module.exports = Response

function generateAccept(request) {
  let key = request.headers['sec-websocket-key'].replace(' ', '') + GUID

  return createHash('sha1').update(key).digest('base64')
}
