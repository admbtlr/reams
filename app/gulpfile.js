// var postcss = require('gulp-postcss')
const { dest, parallel, src, watch } = require('gulp')
var webserver = require('gulp-webserver')
var concat = require('gulp-concat')
var gls = require('gulp-live-server');
var sass = require('gulp-sass');
var jsonSass = require('gulp-json-sass');

// gulp.task('sass', function () {
//   return gulp.src('./webview/**/*.scss')
//     .pipe(sass().on('error', sass.logError))
//     .pipe(gulp.dest('./ios/webview/css'));
// });

// gulp.task('sass:watch', function () {
//   gulp.watch('./sass/**/*.scss', ['sass']);
// });

function css (cb) {
  return src(['utils/colors.json', 'webview/*.scss'])
    .pipe(jsonSass())
    .pipe(concat('output.scss'))
    .pipe(dest('./web/css'))
    .pipe(dest('./ios/webview/css'))
    .pipe(sass())
    .pipe(dest('./web/css'))
    .pipe(dest('./ios/webview/css'))
}

function js (cb) {
  return src('webview/*.js')
    .pipe(dest('./web/js'))
    .pipe(dest('./ios/webview/js'))
}

function serve (cb) {
  return src('./ios')
    .pipe(webserver({
      port: 8888,
      open: false
    }))
}

function watchAll () {
  // Watch .scss files
  watch('webview/*.scss', css);
  watch('webview/*.js', js);
}

exports.default = parallel(css, js, serve, watchAll)
