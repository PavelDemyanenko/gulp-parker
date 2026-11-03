# gulp-parker [![test](https://github.com/PavelDemyanenko/gulp-parker/actions/workflows/test.yml/badge.svg)](https://github.com/PavelDemyanenko/gulp-parker/actions/workflows/test.yml)
[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url]

> Gulp plugin for [parker](https://github.com/katiefenn/parker), a stylesheet analysis tool.

*  Took code, ideas from [@leny](https://github.com/leny) and made it work with Gulp.

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://www.npmjs.com/package/gulp-parker
[npm-version-image]: https://img.shields.io/npm/v/gulp-parker.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/gulp-parker.svg?style=flat


## Getting Started

This plugin requires Node.js `>=20` and works with Gulp 4 and Gulp 5.

If you haven't used [Gulp](https://gulpjs.com/) before, be sure to check out the [Getting Started](https://gulpjs.com/docs/en/getting-started/quick-start). Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install gulp-parker --save-dev
```

## The "parker" task

### Overview

In your project's Gulpfile, add a task named `parker`.

```js
const { src } = require('gulp');
const parker = require('gulp-parker');

exports.parker = function () {
	return src('./test.css')
		.pipe(parker());
};
```

Files are passed through unchanged, so the plugin can sit in the middle of a pipeline
(e.g. before `gulp.dest()`). The raw parker results are attached to each file as
`file.parker` (an object keyed by metric id, e.g. `{ 'total-rules': 4 }`).

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
One report covering all processed files is written when the stream ends; an existing file is overwritten.  
If `false` is given, the file will not be written.

#### options.title

Type: `String`  
Default value: `Gulp Parker Report`

When logging the reported results to file, use this as title of the markdown document.

### Usage Examples

#### Default Options

In this example, the default options are used to shows the results of the parker analysis for the given files.

```js
exports.parker = function () {
	return src('./*.css')
		.pipe(parker());
};
```

#### Custom Options

In this example, custom options are used to shows the results of the parker analysis for the given files, with only the two given metrics, and write the results on a file named `report.md`

```js
exports.parker = function () {
	return src('./*.css')
		.pipe(parker({
			file: 'report.md',
			title: 'Gulp test report',
			metrics: [
				'TotalRules',
				'TotalStylesheets'
			]
		}));
};
```

## Contributing

Run the test suite with `npm test`.

## Release History

* **2015/02/20** : v0.1.0

* **2018/04/27** : v0.1.6
Update Parker;
Replace result file, not append;
Remove logging

* **2026/11/03** : v1.0.0 (breaking)
Requires Node.js 20+; tested with Gulp 5;
Vinyl files are now passed through (results available as `file.parker`) instead of emitting result arrays;
The markdown report now contains every processed file (previously only the last one) and is written once at the end of the stream;
Fixed broken date in the report footer and file paths in report headings;
Unknown metric names now throw a clear error;
Dropped `through2`, `object-assign`, `date-format`; updated `plugin-error`, `fancy-log`, `ansi-colors`;
Parker's CLI entry point (and its `minimist`/`cli-color` dependencies) is no longer loaded;
Travis CI replaced with GitHub Actions
