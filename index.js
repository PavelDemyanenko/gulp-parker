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

		var kindOf, kindsOf, metrics, aLogFileLines, aMetrics, oMetric, oOptions, oParsedMetrics, parker, sDefaultTitle, sMetric, sTitle, _i, _len;

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

		//var fileOpts = objectAssign({}, opts);

		try {

			oOptions = {
				metrics: false,
				file: "report.md",
				title: false
			};

			aLogFileLines = [];
			sDefaultTitle = "Gulp Parker Report";

			if (Array.isArray(oOptions.metrics)) {
				aMetrics = (function() {
					var _i, _len, _ref, _results;
					_ref = oOptions.metrics;
					_results = [];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						sMetric = _ref[_i];
						_results.push(require("parker/metrics/" + sMetric + ".js"));
					}
					return _results;
				})();
			} else {
				aMetrics = require("parker/metrics/All.js");
			}

			parker = new Parker(aMetrics);
			oParsedMetrics = {};
			for (_i = 0, _len = aMetrics.length; _i < _len; _i++) {
				oMetric = aMetrics[_i];
				oParsedMetrics[oMetric.id] = oMetric;
			}

			if (oOptions.file) {
				if (sTitle = oOptions.title || sDefaultTitle) {
					aLogFileLines.push("# " + sTitle);
					aLogFileLines.push("");
					if (sTitle !== sDefaultTitle) {
						aLogFileLines.push("## Parker Report");
					}
				} else {
					aLogFileLines.push("# " + sDefaultTitle);
				}
				aLogFileLines.push("");
			}

			var aFileResults, aResult, aResults, mValue, oParkerMetrics, sResult, sValue, _j, _len1;
			aResults = [];
			aFileResults = [];
			oParkerMetrics = parker.run(file, file.path);
			if (oParkerMetrics) {
				for (sMetric in oParkerMetrics) {
					mValue = oParkerMetrics[sMetric];
					aResults.push([oParsedMetrics[sMetric].name, mValue]);
				}
				if (aResults.length) {
					gutil.log(file.path);
					for (_j = 0, _len1 = aResults.length; _j < _len1; _j++) {
						aResult = aResults[_j];
						sValue = (function() {
							var _k, _l, _len2, _len3, _ref, _ref1, _results;
							switch (kindOf(aResult[1])) {
								case "array":
									gutil.log(gutil.colors.cyan("" + aResult[0] + ":"));
									_ref = aResult[1];
									for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
										sResult = _ref[_k];
										gutil.log("\t" + sResult);
									}
									aFileResults.push("- **" + aResult[0] + ":**");
									_ref1 = aResult[1];
									_results = [];
									for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
										sResult = _ref1[_l];
										if (sResult.substring(0, 1) === "#") {
											sResult = "`" + sResult + "`";
										}
										_results.push(aFileResults.push("\t- " + sResult));
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
				if (oOptions.file && aFileResults.length) {
					aLogFileLines.push("### " + file.path);
					aLogFileLines.push("");
					aLogFileLines = aLogFileLines.concat(aFileResults);
				}
			}
			if (oOptions.file) {
				aLogFileLines.push("");
				aLogFileLines.push("* * *");
				aLogFileLines.push("");
				aLogFileLines.push("Last generated: " + (gutil.date(new Date(), 'mm/dd/yyyy, HH:MM:ss')) + " by [gulp-parker](https://github.com/PavelDemyanenko/gulp-parker).");
				aLogFileLines.push("");
				require('fs').writeFile(oOptions.file, aLogFileLines.join("\n"));
				gutil.log("Logged in " + (gutil.colors.yellow(oOptions.file)));
			}

		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-parker', err, {fileName: file.path}));
		}

		cb();
	});
};
