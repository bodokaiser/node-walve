const chai = require('chai')
const http = require('http')
const walve = require('../lib')
const stream = require('readable-stream')

describe('Response', () => {

  var source, request, response

  beforeEach(() => {
    source = new stream.PassThrough()
    request = new http.IncomingMessage(source)
    request.headers['sec-websocket-key'] = 'dGhlIHNhbXBsZSBub25jZQ=='
    response = new walve.Response(request)
  })

  describe('new Response(request)', () => {

    it('should be an instance of ServerResponse', () => {
      chai.expect(response).to.be.instanceOf(http.ServerResponse)
    })

  })

})
