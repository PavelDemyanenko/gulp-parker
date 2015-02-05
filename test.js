'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var parker = require('./');

it('should parker CSS', function (cb) {
	var stream = parker();

	stream.on('data', function (file) {

	});

	stream.on('end', cb);

	stream.write(new gutil.File({

	}));

	stream.end();
});
