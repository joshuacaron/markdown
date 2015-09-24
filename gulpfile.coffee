gulp = require 'gulp'
plumber = require 'gulp-plumber'
uglify = require 'gulp-uglify'
minifyCSS = require 'gulp-minify-css'
gutil = require 'gulp-util'
vulcanize = require 'gulp-vulcanize'
autoprefixer = require 'gulp-autoprefixer'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

paths =
  css: "css/*.css"
  assets: "assets/*"

onError = (error) ->
  gutil.beep()
  console.log error

gulp.task 'browserify', ->
  browserify 'components/markdown-editor.js'
    .bundle()
    .pipe source 'markdown-editor-bundled.js'
    .pipe gulp.dest 'components'

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

gulp.task 'html', ['browserify'], ->
  gulp.src "index.html"
    .pipe plumber
      errorHandler: onError
    .pipe vulcanize
      dest: 'release'
      strip: true,
      inline: true,
      csp: true
    .pipe gulp.dest 'release'

gulp.task 'default', ['css', 'assets', 'manifest', 'background', 'html']