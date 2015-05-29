gulp = require 'gulp'
plumber = require 'gulp-plumber'
uglify = require 'gulp-uglify'
minifyCSS = require 'gulp-minify-css'
gutil = require 'gulp-util'
vulcanize = require 'gulp-vulcanize'
autoprefixer = require 'gulp-autoprefixer'

paths =
  css: "css/*.css"
  assets: "assets/*"

onError = (error) ->
  gutil.beep()
  console.log error


gulp.task 'css', ->
  gulp.src paths.css
    .pipe plumber
      errorHandler: onError
    .pipe autoprefixer()
    .pipe minifyCSS()
    .pipe gulp.dest 'release/css'

gulp.task 'assets', ->
  gulp.src paths.assets
    .pipe plumber
      errorHandler: onError
    .pipe gulp.dest 'release/assets'

gulp.task 'background', ->
  gulp.src "background.js"
    .pipe plumber
      errorHandler: onError
    .pipe uglify()
    .pipe gulp.dest 'release'

gulp.task 'manifest', ->
  gulp.src "manifest.json"
    .pipe plumber
      errorHandler: onError
    .pipe gulp.dest 'release'

gulp.task 'html', ->
  gulp.src "index.html"
    .pipe plumber
      errorHandler: onError
    .pipe vulcanize
      dest: 'release'
      strip: true,
      inline: true,
      csp: true
    .pipe gulp.dest 'release'

gulp.task 'watch', ->
  gulp.watch paths.css, ['css']
  gulp.watch "index.html", ['html']
  gulp.watch paths.assets, ['assets']
  gulp.watch "background.js", ['background']
  gulp.watch "manifest.json", ["manifest"]

gulp.task 'default', ['watch','css','html','assets','background','manifest']