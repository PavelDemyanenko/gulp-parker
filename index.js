'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var objectAssign = require('object-assign');
var Parker = require('parker');

module.exports = function (opts) {
	opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-parker', 'Streaming not supported'));
			return;
		}

		var res, metrics, parker, parkerMetrics;
		var fileOpts = objectAssign({}, opts);

		try {
			console.log(file, file.path);
			metrics = require("parker/metrics/All.js");
			parker = new Parker(metrics);
			parkerMetrics = parker.run(file, file.path);
			console.log(parkerMetrics);
			//file.contents = new Buffer(result);

			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-parker', err, {fileName: file.path}));
		}

		cb();
	});
};
