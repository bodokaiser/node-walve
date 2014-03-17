THOR  = node_modules/.bin/thor
MOCHA = node_modules/.bin/mocha

THOR_FLAGS = \
		--amount     200 		\
		--buffer     200		\
		--messages   100 		\
		--concurrent 50

MOCHA_FLAGS = \
		--reporter spec

test:
	$(MOCHA) $(MOCHA_FLAGS) test

bench:
	$(THOR) $(THOR_FLAGS) ws://localhost:3000

bench-single: spawn-single bench kill

bench-cluster: spawn-cluster bench kill

spawn-single:
	@node opt/echo &

spawn-cluster:
	@node opt/cluster &

kill:
	@killall node


.PHONY: test
