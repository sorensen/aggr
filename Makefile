SHELL := /bin/bash

test:
	mocha -R spec test.js

hint:
	@jshint index.js package.json

.PHONY: test hint
