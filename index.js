'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Transform } = require('node:stream');
const PluginError = require('plugin-error');
const log = require('fancy-log');
const colors = require('ansi-colors');
// Require the library directly instead of `parker` (its CLI entry point),
// so the CLI-only dependencies (minimist, cli-color, async) are never loaded.
const Parker = require('parker/lib/Parker.js');

const PLUGIN_NAME = 'gulp-parker';
const DEFAULT_TITLE = 'Gulp Parker Report';

function loadMetrics(names) {
	if (names === undefined || names === null || names === false) {
		return require('parker/metrics/All.js');
	}

	if (!Array.isArray(names)) {
		throw new PluginError(PLUGIN_NAME, '`metrics` option must be an array of metric names');
	}

	return names.map((name) => {
		if (typeof name !== 'string' || !/^[A-Za-z]+$/.test(name)) {
			throw new PluginError(PLUGIN_NAME, `Invalid metric name: ${JSON.stringify(name)}`);
		}
		try {
			return require(`parker/metrics/${name}.js`);
		} catch (err) {
			if (err.code === 'MODULE_NOT_FOUND') {
				throw new PluginError(PLUGIN_NAME, `Unknown metric: "${name}"`);
			}
			throw err;
		}
	});
}

function pad(n) {
	return String(n).padStart(2, '0');
}

function formatDate(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
		`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatListItem(value) {
	const str = String(value);
	return str.startsWith('#') ? `\`${str}\`` : str;
}

function logResults(filePath, rows) {
	log(filePath);
	for (const [name, value] of rows) {
		if (Array.isArray(value)) {
			log(colors.cyan(`${name}:`));
			for (const item of value) {
				log(`\t${item}`);
			}
		} else if (typeof value === 'number') {
			log(colors.cyan(`${name}:`), colors.yellow(String(value)));
		} else {
			log(colors.cyan(`${name}:`), value);
		}
	}
}

function buildReport(title, sections) {
	const lines = [`# ${title}`, ''];

	for (const { filePath, rows } of sections) {
		lines.push(`### ${filePath}`, '');
		for (const [name, value] of rows) {
			if (Array.isArray(value)) {
				lines.push(`- **${name}:**`);
				for (const item of value) {
					lines.push(`  - ${formatListItem(item)}`);
				}
			} else {
				lines.push(`- **${name}:** ${value}`);
			}
		}
		lines.push('');
	}

	lines.push(
		'* * *',
		'',
		`Last generated: ${formatDate(new Date())} by [gulp-parker](https://github.com/PavelDemyanenko/gulp-parker).`,
		''
	);

	return lines.join('\n');
}

module.exports = function gulpParker(options) {
	const opts = Object.assign({ metrics: false, file: false, title: false }, options);
	const metrics = loadMetrics(opts.metrics);
	const metricNames = new Map(metrics.map((metric) => [metric.id, metric.name]));
	const parker = new Parker(metrics);
	const sections = [];

	return new Transform({
		objectMode: true,

		transform(file, enc, cb) {
			if (file.isNull()) {
				cb(null, file);
				return;
			}

			if (file.isStream()) {
				cb(new PluginError(PLUGIN_NAME, 'Streaming not supported', { fileName: file.path }));
				return;
			}

			let results;
			try {
				results = parker.run(file.contents.toString()) || {};
			} catch (err) {
				cb(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
				return;
			}

			const rows = Object.keys(results).map((id) => [metricNames.get(id) || id, results[id]]);
			const relativePath = path.relative(process.cwd(), file.path).split(path.sep).join('/');

			file.parker = results;
			logResults(file.path, rows);
			sections.push({ filePath: relativePath, rows });

			cb(null, file);
		},

		flush(cb) {
			if (!opts.file || sections.length === 0) {
				cb();
				return;
			}

			const reportPath = path.resolve(String(opts.file));
			const report = buildReport(opts.title || DEFAULT_TITLE, sections);

			fs.promises.mkdir(path.dirname(reportPath), { recursive: true })
				.then(() => fs.promises.writeFile(reportPath, report))
				.then(() => {
					log(`Logged in ${colors.yellow(String(opts.file))}`);
					cb();
				})
				.catch((err) => cb(new PluginError(PLUGIN_NAME, err)));
		}
	});
};
