'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var parker = require('./');

it('should parker CSS', function (cb) {
	var stream = parker();

	stream.on('data', function (file) {
		assert.equal(file.relative, 'fixture.css');
	});

	stream.on('end', cb);

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: __dirname + '/fixture/fixture.css',
		contents: new Buffer('a {\n\tdisplay: flex;\n}')
	}));

	stream.end();
});
