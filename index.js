'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var objectAssign = require('object-assign');
var Parker = require('parker');
var fs = require('fs');

module.exports = function (opts) {

	var oDefaultOptions;

	oDefaultOptions = {
		metrics: false,
		file: false,
		title: false
	};

	opts = opts || oDefaultOptions;

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-parker', 'Streaming not supported'));
			return;
		}

		var kindOf, kindsOf, metrics, aLogFileLines, aMetrics, oMetric, oParsedMetrics, parker, sDefaultTitle, sMetric, sTitle;

		kindsOf = {};

		"Number String Boolean Function RegExp Array Date Error".split(" ").forEach(function(k) {
			return kindsOf["[object " + k + "]"] = k.toLowerCase();
		});

		kindOf = function(value) {
			if (value == null) {
				return String(value);
			}
			return kindsOf[kindsOf.toString.call(value)] || "object";
		};

		var fileOpts = objectAssign(oDefaultOptions, opts);

		console.log("fileOpts", fileOpts);

		try {

			aLogFileLines = [];
			sDefaultTitle = "Gulp Parker Report";

			if (Array.isArray(fileOpts.metrics)) {
				aMetrics = (function() {
					var _results = [];
					for (var i = 0; i < fileOpts.metrics.length; i++) {
						sMetric = fileOpts.metrics[i];
						_results.push(require("parker/metrics/" + sMetric + ".js"));
					}
					return _results;
				})();
			} else {
				aMetrics = require("parker/metrics/All.js");
			}

			parker = new Parker(aMetrics);
			oParsedMetrics = {};
			for (var i = 0; i < aMetrics.length; i++) {
				oMetric = aMetrics[i];
				oParsedMetrics[oMetric.id] = oMetric;
			}

			if (fileOpts.file) {
				if (!fs.existsSync(fileOpts.file)) {
					if (sTitle = fileOpts.title || sDefaultTitle) {
						aLogFileLines.push("# " + sTitle);
						aLogFileLines.push("");
						if (sTitle !== sDefaultTitle) {
							aLogFileLines.push("## Parker Report");
						}
					} else {
						aLogFileLines.push("# " + sDefaultTitle);
					}
				}
				aLogFileLines.push("");
			}

			var aFileResults, aResult, aResults, mValue, oParkerMetrics, sResult, sValue;
			aResults = [];
			aFileResults = [];
			oParkerMetrics = parker.run(file.contents.toString());
			if (oParkerMetrics) {
				for (sMetric in oParkerMetrics) {
					mValue = oParkerMetrics[sMetric];
					aResults.push([oParsedMetrics[sMetric].name, mValue]);
				}
				if (aResults.length) {
					gutil.log(file.path);
					for (var j = 0; j < aResults.length; j++) {
						aResult = aResults[j];
						sValue = (function() {
							switch (kindOf(aResult[1])) {
								case "array":
									gutil.log(gutil.colors.cyan("" + aResult[0] + ":"));
									for (var k = 0; k < aResult[1].length; k++) {
										sResult = aResult[1][k];
										gutil.log("\t" + sResult);
									}
									aFileResults.push("- **" + aResult[0] + ":**");
									var _results = [];
									for (var l = 0; l < aResult[1].length; l++) {
										sResult = aResult[1][l];
										if (sResult.substring(0, 1) === "#") {
											sResult = "`" + sResult + "`";
										}
										_results.push(aFileResults.push("\t=- " + sResult));
									}
									return _results;
									break;
								case "number":
									gutil.log(gutil.colors.cyan("" + aResult[0] + ":"), gutil.colors.yellow(aResult[1]));
									return aFileResults.push("- **" + aResult[0] + ":** " + aResult[1]);
								default:
									gutil.log(gutil.colors.cyan("" + aResult[0] + ":"), aResult[1]);
									return aFileResults.push("- **" + aResult[0] + ":** " + aResult[1]);
							}
						})();
					}
				}
				if (fileOpts.file && aFileResults.length) {
					aLogFileLines.push("### " + file.path.replace(__dirname + '/', ''));
					aLogFileLines.push("");
					aLogFileLines = aLogFileLines.concat(aFileResults);
				}
			}
			if (fileOpts.file) {
				aLogFileLines.push("");
				aLogFileLines.push("* * *");
				aLogFileLines.push("");
				aLogFileLines.push("Last generated: " + (gutil.date(new Date(), 'mm/dd/yyyy, HH:MM:ss')) + " by [gulp-parker](https://github.com/PavelDemyanenko/gulp-parker).");
				aLogFileLines.push("");
				if (fs.existsSync(fileOpts.file)) {
					fs.appendFile(fileOpts.file, aLogFileLines.join("\n"));
				} else {
					fs.writeFile(fileOpts.file, aLogFileLines.join("\n"));
				}
				gutil.log("Logged in " + (gutil.colors.yellow(fileOpts.file)));
			}
			this.push(aResults);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-parker', err, {fileName: file.path}));
		}

		cb();
	});
};
