SHELL := /bin/bash

test:
	mocha -R spec test.js

hint:
	@jshint index.js package.json example.js test.js

# UglifyJS v1.3.4
min:
	@echo -n ';' > aggr.min.js; uglifyjs -nc aggr.js >> aggr.min.js;

.PHONY: test hint min
