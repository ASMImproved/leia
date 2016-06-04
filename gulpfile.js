var gulp = require('gulp');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var typescript = require('typescript');
var sourcemaps = require('gulp-sourcemaps');
var rimraf = require('gulp-rimraf');
var sass = require('gulp-sass');
var jasmine = require('gulp-jasmine');
const reporters = require('jasmine-reporters');
var watch = require('gulp-watch');
var nodeServer = require('gulp-develop-server');
var Karma = require('karma').Server;
var browserSync = require('browser-sync').create();
var typings = require("gulp-typings");

var watching = false;

// Main task
gulp.task('default' , function () {
	runSequence(
		['typescript-server', 'ace-mips-mode']
	);
});

gulp.task('watch', function() {
	watching = true;
	runSequence(
		[
			'typescript-server-watch',
		],
		['jasmine-server']
	)
});

gulp.task('test_server', function() {
	runSequence(
		['typescript-server', 'vendor'],
		'jasmine-server',
		function (err) {
			if (err) {
				failOnSingleBuild();
			}
		}
	)
});

function failOnSingleBuild() {
	if (!watching)
		process.exit(1);
}

var tsServerProject = ts.createProject('tsconfig.server.json', {
	typescript: typescript
});

gulp.task('typescript-server', function() {
	return gulp.src(['src/server/**/**.ts', 'src/common/**/**.ts'], {base: 'src/'})
		.pipe(sourcemaps.init())
		.pipe(ts(tsServerProject))
		//.on('error', failOnSingleBuild)
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist'));
});
gulp.task('typescript-server-watch', function() {
	return gulp.watch(
		['src/server/**/**.ts', 'src/common/**/**.ts'],
		['typescript-server', nodeServer.restart]
	);
});

gulp.task('ace-mips-mode', function() {
	return gulp.src('src/client/ace/mode-mips.js')
		.pipe(gulp.dest('dist/public/'))
});

gulp.task('clean', function() {
	return gulp.src(['dist/'])
		.pipe(rimraf())
});

gulp.task('jasmine-server', function() {
	gulp.src(["dist/server/**/*.spec.js"])
		.pipe(jasmine({
			reporter: new reporters.JUnitXmlReporter({
				savePath: '/tests/server/',
				consolidateAll: true
			}),
			errorOnFail: true
		}))
});

gulp.task('karma', function(done) {
	new Karma({
		configFile: __dirname + '/karma.conf.js'
	}, done).start()
});
gulp.task('karma-watch', function(done) {
	new Karma({
		configFile: __dirname + '/karma.conf.js',
		singleRun: false
	}, done).start()
});

gulp.task('api-tests', function (done) {
	new Karma({
		singleRun: true,
		
	}, done).start();
})
