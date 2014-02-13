var chai      = require('chai');
var http      = require('http');
var stream    = require('stream');
var salvatore = require('../lib');

describe('UpgradeResponse', function() {

  var source, request, response;

  beforeEach(function() {
    source = new stream.PassThrough();
    request = new http.IncomingMessage(source);
    response = new salvatore.Response(request);
  });

  describe('new UpgradeResponse(request)', function() {

    xit('should be an instance of ServerResponse', function() {
      chai.expect(response).to.be.instanceOf(http.ServerResponse);
    });

  });

});
