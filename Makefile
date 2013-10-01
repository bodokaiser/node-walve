test: test-outgoing test-socket test-server

test-outgoing:
	./node_modules/.bin/mocha \
		tests/outgoing

test-socket:
	./node_modules/.bin/mocha \
		tests/socket

test-client:
	./node_modules/.bin/mocha \
		tests/client

test-server:
	./node_modules/.bin/mocha \
		tests/server
