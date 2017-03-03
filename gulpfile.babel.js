import gulp from 'gulp';
import watch from 'gulp-watch';

import browserify from 'browserify';
import babelify from 'babelify';
import css from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import nested from 'postcss-nested';
import rename from 'gulp-rename';
import nunjucks from 'gulp-nunjucks';
import connect from 'gulp-connect';
import source from 'vinyl-source-stream';

gulp.task('babel', () =>
	browserify({ entries: ['src/main.js'], debug: true })
		.transform(babelify)
		.transform({ global: true }, 'uglifyify')
		.bundle()
		.pipe(source('main.js'))
		.pipe(gulp.dest('dist'))
);

gulp.task('css', () =>
	gulp.src('src/*.scss')
		.pipe(css([
			autoprefixer({browsers: ['last 1 version']}),
			nested(),
			cssnano()
		]))
		.pipe(rename('style.css'))
		.pipe(gulp.dest('dist')));

gulp.task('html', () =>
	gulp.src('src/index.html')
		.pipe(nunjucks.compile())
		.pipe(gulp.dest('dist')));

gulp.task('json', () =>
	gulp.src('src/autocomplete.json')
		.pipe(gulp.dest('dist')));

gulp.task('connect', () => {
	connect.server({ root: 'dist', port: 4000 });
	watch('src/*.scss', () => gulp.start('css'));
	watch('src/*.js', () => gulp.start('babel'));
});

gulp.task('build', ['babel', 'css', 'html', 'json']);
gulp.task('dev', ['babel', 'css', 'html', 'json', 'connect']);
