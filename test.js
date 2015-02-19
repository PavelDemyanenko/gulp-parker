'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var rimraf = require('rimraf');
var fs = require('fs');
var parker = require('./');

it('should parker CSS', function (cb) {
	var stream = parker();

	stream.on('data', function () {});

	stream.on('end', function () {
		assert(fs.existsSync('report.md'));
		rimraf.sync('report.md');
		cb();
	});

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: __dirname + '/fixture/fixture.css',
		contents: new Buffer('a {\n\tdisplay: flex;\n}' +
							' .black {\n\tcolor: black !important;\n}' +
							' #black {\n\tcolor: #000000;\n} ' +
							'.white {\n\tcolor: #fff;\n} ')
	}));

	stream.end();
});
