const chai = require('chai')
const http = require('http')
const events = require('events')
const walve = require('../lib')

const PORT = process.env.PORT || 3000


describe('Server', () => {

  var server, wserver

  beforeEach(() => {
    server = new http.Server().listen(PORT)
    wserver = new walve.Server().listen(server)
  })

  describe('new Server([options])', () => {

    it('should return instance of EventEmitter', () => {
      chai.expect(wserver).to.be.an.instanceOf(events.EventEmitter)
    })

  })

  describe('#listen(server)', () => {

    it('should listen to the servers "upgrade" event', () => {
      chai.expect(server.listeners('upgrade')).to.have.length(1)
    })

    it('should listen on url specific upgrades', done => {
      wserver.url = '/images'

      let req1 = http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        path: '/',
        port: PORT
      })
      req1.once('upgrade', () => {
        throw new Error('Should not upgrade!')
      })
      req1.end()

      let req2 = http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        path: '/images',
        port: PORT
      })
      req2.once('upgrade', () => done())
      req2.end()
    })

  })

  describe('Event: "connect"', () => {

    it('should be emitted on WebSocket connect', done => {
      let request = http.request({
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          'Sec-WebSocket-Key': '1234',
          'Sec-WebSocket-Version': '13'
        },
        port: PORT
      })
      request.once('upgrade', (res, socket) => {
        socket.write(Buffer.from([0x81, 0x03, 0x48, 0x65, 0x79]))
      })
      request.end()

      wserver.once('connect', wsocket => {
        chai.expect(wsocket).to.be.an.instanceOf(walve.Socket)

        wsocket.once('incoming', incoming => {
          var result = ''

          incoming.on('readable', () => result += incoming.read().toString())
          incoming.on('end', () => {
            chai.expect(result).to.equal('Hey')

            done()
          })
        })
      })
    })

  })

  afterEach(() => {
    server.close()
  })

})
