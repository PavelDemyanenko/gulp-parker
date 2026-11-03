'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Readable } = require('node:stream');
const Vinyl = require('vinyl');
const parker = require('..');

const CSS = 'a {\n\tdisplay: flex;\n}' +
	' .black {\n\tcolor: black !important;\n}' +
	' #black {\n\tcolor: #000;\n} ' +
	'.white {\n\tcolor: #fff;\n} ';

function cssFile(name, contents) {
	return new Vinyl({
		cwd: process.cwd(),
		base: path.join(process.cwd(), 'fixture'),
		path: path.join(process.cwd(), 'fixture', name),
		contents: Buffer.from(contents)
	});
}

function run(stream, files) {
	return new Promise((resolve, reject) => {
		const out = [];
		stream.on('data', (file) => out.push(file));
		stream.on('error', reject);
		stream.on('end', () => resolve(out));
		files.forEach((file) => stream.write(file));
		stream.end();
	});
}

describe('gulp-parker', () => {
	let tmpDir;

	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gulp-parker-'));
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	it('passes files through and attaches results as file.parker', async () => {
		const input = cssFile('fixture.css', CSS);
		const out = await run(parker({ metrics: ['TotalRules', 'TotalStylesheets', 'UniqueColours'] }), [input]);

		assert.equal(out.length, 1);
		assert.equal(out[0], input);
		assert.equal(out[0].contents.toString(), CSS);
		assert.deepEqual(out[0].parker, {
			'total-rules': 4,
			'total-stylesheets': 1,
			'unique-colours': ['#000000', '#FFFFFF']
		});
	});

	it('uses all metrics by default', async () => {
		const out = await run(parker(), [cssFile('fixture.css', CSS)]);
		const allIds = require('parker/metrics/All.js').map((metric) => metric.id);

		assert.deepEqual(Object.keys(out[0].parker).sort(), allIds.sort());
	});

	it('writes a single markdown report covering every file', async () => {
		const reportPath = path.join(tmpDir, 'nested', 'report.md');
		await run(parker({
			file: reportPath,
			title: 'Gulp test report',
			metrics: ['TotalRules', 'UniqueColours']
		}), [
			cssFile('one.css', '.a { color: #f00; }'),
			cssFile('two.css', '.b { color: #0f0; } .c { color: #00f; }')
		]);

		const report = fs.readFileSync(reportPath, 'utf8');
		assert.match(report, /^# Gulp test report\n/);
		assert.match(report, /### fixture\/one\.css\n\n- \*\*Total Rules:\*\* 1\n- \*\*Unique Colours:\*\*\n {2}- `#FF0000`/);
		assert.match(report, /### fixture\/two\.css\n\n- \*\*Total Rules:\*\* 2\n/);
		assert.match(report, /Last generated: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} by/);
	});

	it('overwrites an existing report instead of appending', async () => {
		const reportPath = path.join(tmpDir, 'report.md');
		fs.writeFileSync(reportPath, 'stale content');

		await run(parker({ file: reportPath, metrics: ['TotalRules'] }), [cssFile('a.css', '.a{}')]);

		const report = fs.readFileSync(reportPath, 'utf8');
		assert.doesNotMatch(report, /stale content/);
		assert.match(report, /^# Gulp Parker Report\n/);
	});

	it('passes null files through untouched', async () => {
		const input = new Vinyl({ path: path.join(process.cwd(), 'empty.css') });
		const out = await run(parker(), [input]);

		assert.equal(out.length, 1);
		assert.equal(out[0], input);
		assert.equal(out[0].parker, undefined);
	});

	it('emits an error for streaming files', async () => {
		const input = new Vinyl({
			path: path.join(process.cwd(), 'stream.css'),
			contents: Readable.from(['a{}'])
		});

		await assert.rejects(run(parker(), [input]), /Streaming not supported/);
	});

	it('throws on unknown metric names', () => {
		assert.throws(() => parker({ metrics: ['NoSuchMetric'] }), /Unknown metric: "NoSuchMetric"/);
		assert.throws(() => parker({ metrics: ['../../evil'] }), /Invalid metric name/);
		assert.throws(() => parker({ metrics: 'TotalRules' }), /must be an array/);
	});
});
