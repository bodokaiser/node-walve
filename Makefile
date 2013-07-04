test: test-outgoing test-socket test-server

test-outgoing:
	./node_modules/.bin/mocha test/outgoing.js

test-socket:
	./node_modules/.bin/mocha \
		test/socket.events.js \
		test/socket.js

test-server:
	./node_modules/.bin/mocha test/server.js
