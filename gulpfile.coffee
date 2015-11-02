autoprefixer = require 'gulp-autoprefixer'
browserify = require 'browserify'
gulp = require 'gulp'
gutil = require 'gulp-util'
minifyCSS = require 'gulp-minify-css'
plumber = require 'gulp-plumber'
source = require 'vinyl-source-stream'
uglify = require 'gulp-uglify'
vulcanize = require 'gulp-vulcanize'
generateThemes = require './scripts/generate-themes-file.js'

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

gulp.task 'generate-themes', ->
  generateThemes()

gulp.task 'html', ['browserify', 'generate-themes'], ->
  gulp.src "index.html"
    .pipe plumber
      errorHandler: onError
    .pipe vulcanize
      dest: 'release',
      strip: true,
      inline: true,
      csp: true
    .pipe gulp.dest 'release'

gulp.task 'default', ['css', 'assets', 'manifest', 'background', 'html']