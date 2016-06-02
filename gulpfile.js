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
		['typescript-client', 'typescript-server', 'index', 'vendor', 'template', 'sass', 'ace-mips-mode']
	);
});

gulp.task('watch', function() {
	watching = true;
	runSequence(
		[
			'install-typings-watch',
			'typescript-client-watch',
			'typescript-server-watch',
			'index-watch',
			'vendor-watch',
			'template-watch',
			'sass-watch'
		],
		['browser-sync', 'jasmine-server', 'karma-watch']
	)
});

gulp.task('browser-sync', function() {
	nodeServer.listen({
		path: 'dist/server/main.js',
		env: {
			port: 8080
		}
	});
	browserSync.init({
		proxy: "localhost:8080",
		port: 80,
		notify: false
	});
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

gulp.task('test_client', function() {
	runSequence(
		['typescript-client', 'index', 'vendor', 'template', 'sass'],
		'karma',
		function (err) {
			if (err) {
				failOnSingleBuild();
			}
		}
	)
});

var tsProject = ts.createProject('tsconfig.json', {
	typescript: typescript
});

function failOnSingleBuild() {
	if (!watching)
		process.exit(1);
}

gulp.task('typescript-client', function () {
	return gulp.src(['src/client/app/**/**.ts', 'src/common/**/**.ts', 'typings/core-js/index.d.ts'], {base: 'src/'})
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject))
		//.on('error', failOnSingleBuild)
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/public/'))
		.pipe(browserSync.stream());
});
gulp.task('typescript-client-watch', function() {
	return gulp.watch(['src/client/app/**/**.ts', 'src/common/**/**.ts'], ['typescript-client']);
});

gulp.task('typescript-server', function() {
	return gulp.src(['src/server/**/**.ts', 'src/common/**/**.ts'], {base: 'src/'})
		.pipe(sourcemaps.init())
		.pipe(ts({
			target: "es6",
			module: "commonjs",
			moduleResolution: "node",
			experimentalDecorators: true,
			emitDecoratorMetadata: true
		}))
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

gulp.task('template', function () {
	return gulp.src(['src/client/app/**/**.html'], {base: 'src/app'})
        .pipe(gulp.dest('dist/public/app'))
		.pipe(browserSync.stream());
});
gulp.task('template-watch', function() {
	return gulp.watch(['src/client/app/**/**.html'], ['template']);
});

gulp.task('index', function() {
	return gulp.src('src/client/index.html')
		.pipe(gulp.dest('dist/public/'))
		.pipe(browserSync.stream())
});
gulp.task('index-watch', function() {
	return gulp.watch(['src/client/index.html'], ['index']);
});

gulp.task('vendor', function() {
	return gulp.src([
			'node_modules/core-js/**/**',
			'node_modules/systemjs/**/**',
			'node_modules/@angular/**/**',
			'node_modules/reflect-metadata/**/**',
			'node_modules/rxjs/**/**',
			'node_modules/zone.js/**/**',
			'node_modules/async/**/**'
		], {base: 'node_modules'})
		.pipe(gulp.dest('dist/public/vendor/'))
		.pipe(browserSync.stream())
});
gulp.task('vendor-watch', function() {
	return gulp.watch([
		'node_modules/core-js/**/**',
		'node_modules/systemjs/**/**',
		'node_modules/@angular/**/**',
		'node_modules/reflect-metadata/**/**',
		'node_modules/rxjs/**/**',
		'node_modules/zone.js/**/**',
		'node_modules/async/**/**'
	], ['vendor', nodeServer.restart]);
});

gulp.task('ace-mips-mode', function() {
	return gulp.src('src/client/ace/mode-mips.js')
		.pipe(gulp.dest('dist/public/'))
});

gulp.task('sass', function() {
	return gulp.src('src/client/sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('dist/public/css'))
		.pipe(browserSync.stream())
});
gulp.task('sass-watch', function() {
	return gulp.watch(['src/client/sass/**/*.scss'], ['sass']);
});

gulp.task('install-typings', function() {
	return gulp.src('typings.json')
		.pipe(typings())
});
gulp.task('install-typings-watch', function() {
	return gulp.watch(['typings.json'], ['install-typings']);
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
			})
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
