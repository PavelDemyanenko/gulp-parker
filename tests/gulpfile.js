var gulp = require('gulp');
var parker = require('..');


gulp.task('parker', function() {
	return gulp.src('./*.css')
		.pipe(parker({
			file: 'report.md',
			title: 'Gulp test report',
			metrics: [
				"TotalRules",
				"TotalStylesheets"
			]}));
});

gulp.task('default', ['parker']);
