// generated on 2017-01-06 using generator-webapp 2.3.2
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const concat = require('gulp-concat');
const jsminify = require('gulp-minify');
const cssminify = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');

const browserify = require('browserify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const config = require('./assets/config.json');

var dev = true;

gulp.task('styles', () => {
  return gulp.src('assets/sass/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 4%', 'last 4 versions']}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {

  var b = browserify({
    entries: 'assets/js/podcast.js',
    debug: dev
  })
  .transform('babelify', {presets: ["es2015"]})
  
  return b.bundle()
    .pipe(source('podcast.js'))
    .pipe($.plumber())
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe($.eslint({
      fix: true, 
      parserOptions: {
        "sourceType": "module"
      } 
    }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('assets/js/**/*.js')
    .pipe(gulp.dest('assets/js'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts'], () => {
    let sync_config = {
      notify: false,
      port: 9000,
      proxy: config.site
    };

    if(config.host){
      sync_config.host = config.host;
    }

    browserSync.init(sync_config);

    gulp.watch([
      'templates/**/*',
    ], {interval: 500}).on('change', reload);

    gulp.watch('assets/sass/**/*.scss', {interval: 1000}, ['styles']);
    gulp.watch('assets/js/**/*.js', {interval: 1000}, ['scripts']);
  });
});

gulp.task('build', ['lint', 'scripts', 'styles'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'], 'build', resolve);
  });
});
