test: test-socket test-outgoing

test-socket:
	./node_modules/.bin/mocha test/socket.js

test-outgoing:
	./node_modules/.bin/mocha test/outgoing.js
