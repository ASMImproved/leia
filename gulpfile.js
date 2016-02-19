var gulp = require('gulp');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var typescript = require('typescript');
var sourcemaps = require('gulp-sourcemaps');
var rimraf = require('gulp-rimraf');
var sass = require('gulp-sass');

// Main task
gulp.task('default' , function () {
	runSequence(
		['typescript-client', 'typescript-server', 'index', 'vendor', 'template', 'sass']
	);
});

var tsProject = ts.createProject('tsconfig.json', {
	typescript: typescript
});

// compiles *.ts files by tsconfig.json file and creates sourcemap filse
gulp.task('typescript-client', function () {
	return gulp.src(['src/client/app/**/**.ts', 'src/common/**/**.ts'], {base: 'src/'})
		.pipe(sourcemaps.init())
        .pipe(ts(tsProject))
		.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/public/'));
});
gulp.task('typescript-watch', function() {
	return gulp.watch(['src/client/app/**/**.ts'], ['typescript']);
})

gulp.task('typescript-server', function() {
	return gulp.src(['src/server/**/**.ts', 'src/common/**/**.ts'], {base: 'src/'})
		.pipe(ts({
			target: "es5",
			module: "commonjs",
			moduleResolution: "node"
		}))
		.pipe(gulp.dest('dist'));
})

gulp.task('template', function () {
	return gulp.src(['src/client/app/**/**.html'], {base: 'src/app'})
        .pipe(gulp.dest('dist/public/app'));
});

gulp.task('index', function() {
	return gulp.src('src/client/index.html')
		.pipe(gulp.dest('dist/public/'))
});

gulp.task('vendor', function() {
	return gulp.src([
			'node_modules/es6-shim/**/**',
			'node_modules/systemjs/**/**',
			'node_modules/angular2/**/**',
			'node_modules/systemjs/**/**',
			'node_modules/rxjs/**/**'
		], {base: 'node_modules'})
		.pipe(gulp.dest('dist/public/vendor/'))
})

gulp.task('sass', function() {
	return gulp.src('src/client/sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('dist/public/css'))
})

gulp.task('clean', function() {
	return gulp.src(['dist/'])
		.pipe(rimraf())
});
