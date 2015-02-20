# gulp-parker [![Build Status](https://travis-ci.org/PavelDemyanenko/gulp-parker.svg?branch=master)](https://travis-ci.org/PavelDemyanenko/gulp-parker)
[![NPM version][npm-version-image]][npm-url] ![Dependency Status](https://david-dm.org/PavelDemyanenko/gulp-parker.svg) [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url]

> Gulp plugin for [parker](https://github.com/katiefenn/parker), a stylesheet analysis tool.

*  Took code, ideas from [@leny](https://github.com/leny) and made it work with Gulp.

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/gulp-parker
[npm-version-image]: http://img.shields.io/npm/v/gulp-parker.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/gulp-parker.svg?style=flat


## Getting Started

This plugin requires Gulp `^3.8.10`

If you haven't used [Gulp](http://gulpjs.com//) before, be sure to check out the [Getting Started](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md). Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install gulp-parker --save-dev
```

## The "parker" task

### Overview

In your project's Gulpfile, add a task named `parker`.

```js
gulp.task('parker', function() {
	return gulp.src('./test.css')
		.pipe(parker());
});
```

### Options

#### options.metrics

Type: `Array` (metric names)  
Default value: `false`

An array of the metrics to use in parker.  
By default, gulp-parker use all available metrics.

By now, gulp-parker accepts the following metrics :

- `TotalStylesheets`
- `TotalStylesheetSize`
- `TotalRules`
- `TotalSelectors`
- `TotalIdentifiers`
- `TotalDeclarations`
- `SelectorsPerRule`
- `IdentifiersPerSelector`
- `SpecificityPerSelector`
- `TopSelectorSpecificity`
- `TopSelectorSpecificitySelector`
- `TotalIdSelectors`
- `TotalUniqueColours`
- `UniqueColours`
- `TotalImportantKeywords`
- `TotalMediaQueries`
- `MediaQueries`

#### options.file

Type: `String` (file path)  
Default value: `false`

A file path to log the reported results, in *markdown* format.  
If `false` is given, the file will not be written.

#### options.title

Type: `String`  
Default value: `Gulp Parker Report`

When logging the reported results to file, use this as title of the markdown document.

### Usage Examples

#### Default Options

In this example, the default options are used to shows the results of the parker analysis for the given files.

```js
gulp.task('parker', function() {
	return gulp.src('./*.css')
		.pipe(parker());
});
```

#### Custom Options

In this example, custom options are used to shows the results of the parker analysis for the given files, with only the four given metrics, and write the results on a file named `report.md`

```js
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
```

## Contributing

Lint and test your code using [Gulp](http://gulpjs.com/).

## Release History

* **2015/02/20** : v0.1.0
