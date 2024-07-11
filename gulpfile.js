const { dest, parallel, src, watch } = require('gulp')
var webserver = require('gulp-webserver')
var concat = require('gulp-concat')
var gls = require('gulp-live-server');
var sass = require('gulp-sass')(require('sass'));
var jsonSass = require('gulp-json-sass');

function css (cb) {
  return src(['utils/colors.json', 'webview/*.scss'])
    .pipe(jsonSass())
    .pipe(concat('output.scss'))
    .pipe(dest('./public/css'))
    .pipe(dest('./ios/webview/css'))
    .pipe(sass())
    .pipe(dest('./public/css'))
    .pipe(dest('./ios/webview/css'))
    .pipe(dest('./android/app/src/main/assets/webview/css'))
}

function js (cb) {
  return src('webview/*.js')
    .pipe(dest('./public/js'))
    .pipe(dest('./ios/webview/js'))
    .pipe(dest('./android/app/src/main/assets/webview/js'))
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