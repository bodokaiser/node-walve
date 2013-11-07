MOCHA = node_modules/.bin/mocha

MOCHA_FLAGS = \
		--reporter spec

test: test-lib

test-lib:
	$(MOCHA) $(MOCHA_FLAGS) \
		test/lib/outgoing	\
		test/lib/socket		\
		test/lib/client		\
		test/lib/server

.PHONY: test
