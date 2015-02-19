# gulp-parker [![Build Status](https://travis-ci.org/PavelDemyanenko/gulp-parker.svg?branch=master)](https://travis-ci.org/PavelDemyanenko/gulp-parker) 
[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url]

> Gulp plugin for [parker](https://github.com/katiefenn/parker), a stylesheet analysis tool. Took code, ideas from [@leny](https://github.com/leny) and made it work with Gulp.  

* * *

## Getting Started


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

