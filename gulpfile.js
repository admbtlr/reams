var postcss = require('gulp-postcss')
var gulp = require('gulp')
var webserver = require('gulp-webserver')
var watch = require('gulp-watch')
var gls = require('gulp-live-server');


gulp.task('css', function () {
  return gulp.src('webview/*.css')
    .pipe(postcss())
    .pipe(gulp.dest('./ios/webview/css'))
})

gulp.task('js', function () {
  return gulp.src('webview/*.js')
    .pipe(gulp.dest('./ios/webview/js'))
})

gulp.task('serve', function () {
  return gulp.src('./ios')
    .pipe(webserver({
      port: 8888,
      open: true
    }))
})

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('webview/*.css', ['css']);
  gulp.watch('webview/*.js', ['js']);
})

gulp.task('default', [ 'css', 'js', 'serve', 'watch' ]);
