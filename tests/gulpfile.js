var gulp = require('gulp');
var parker = require('..');


gulp.task('parker', function() {
	return gulp.src('./test.css')
		.pipe(parker());
});

gulp.task('default', ['parker']);
