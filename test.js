'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var rimraf = require('rimraf');
var fs = require('fs');
var parker = require('./');

it('should parker CSS', function (cb) {
	var stream = parker({
		file: 'report.md',
		title: 'Gulp test report',
		metrics: [
			"TotalRules",
			"TotalStylesheets"
		]
	});

	var buffer = [];

	stream.on('data', function(results) {
		buffer.push(results);
	});

	stream.on('end', function () {
		assert(fs.existsSync('report.md'));
		rimraf.sync('report.md');
		assert.equal(buffer.length, 1);
		assert.deepEqual(buffer[0][0], ["Total Stylesheets", 1]);
		assert.deepEqual(buffer[0][1], ["Total Rules", 4]);
		cb();
	});

	stream.write(new gutil.File({
		cwd: __dirname,
		base: '/fixture',
		path: '/fixture/fixture.css',
		contents: new Buffer('a {\n\tdisplay: flex;\n}' +
							' .black {\n\tcolor: black !important;\n}' +
							' #black {\n\tcolor: #000;\n} ' +
							'.white {\n\tcolor: #fff;\n} ')
	}));

	stream.end();
});
