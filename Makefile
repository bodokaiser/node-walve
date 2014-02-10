MOCHA = node_modules/.bin/mocha

MOCHA_FLAGS = \
		--reporter spec

test:
	$(MOCHA) $(MOCHA_FLAGS) test

.PHONY: test
