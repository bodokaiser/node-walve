var chai   = require('chai');
var http   = require('http');
var stream = require('stream');
var wesos  = require('../lib');

describe('Response', function() {

  var source, request, response;

  beforeEach(function() {
    source = new stream.PassThrough();
    request = new http.IncomingMessage(source);
    response = new wesos.Response(request);
  });

  describe('new Response(request)', function() {

    xit('should be an instance of ServerResponse', function() {
      chai.expect(response).to.be.instanceOf(http.ServerResponse);
    });

  });

});
