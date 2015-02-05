'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var objectAssign = require('object-assign');
var parker = require('parker');

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

		var res;
		var fileOpts = objectAssign({}, opts);

		try {
			res = parker(fileOpts).process(file.contents.toString(), {
				from: file.relative,
				to: file.relative
			});

			file.contents = new Buffer(res.css);

			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-parker', err, {fileName: file.path}));
		}

		cb();
	});
};
