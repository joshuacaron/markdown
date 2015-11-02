var fs = require('fs')
var CleanCSS = require('clean-css')

module.exports = function() {
  var themes = [
    // 'agate', // Causes mysterious bug
    'androidstudio',
    'arta',
    'ascetic',
    'atelier-cave.light',
    'atelier-cave.dark',
    'atelier-dune.light',
    'atelier-dune.dark',
    'atelier-estuary.light',
    'atelier-estuary.dark',
    'atelier-forest.light',
    'atelier-forest.dark',
    'atelier-heath.light',
    'atelier-heath.dark',
    'atelier-lakeside.light',
    'atelier-lakeside.dark',
    'atelier-plateau.light',
    'atelier-plateau.dark',
    'atelier-savanna.light',
    'atelier-savanna.dark',
    'atelier-seaside.light',
    'atelier-seaside.dark',
    'atelier-sulphurpool.light',
    'atelier-sulphurpool.dark',
    // 'brown_paper', // Needs image
    'codepen-embed',
    'color-brewer',
    'dark',
    'darkula',
    'default',
    'docco',
    'far',
    'foundation',
    'github',
    'github-gist',
    'googlecode',
    'grayscale',
    'hopscotch',
    'hybrid',
    'idea',
    'ir_black',
    'kimbie.light',
    'kimbie.dark',
    'magula',
    'mono-blue',
    'monokai',
    'monokai_sublime',
    'obsidian',
    'paraiso.light',
    'paraiso.dark',
    // 'pojoaque', // Needs image
    'railscasts',
    'rainbow',
    // 'school_book', // Needs image
    'solarized_dark',
    'solarized_light',
    'sunburst',
    'tomorrow',
    'tomorrow-night-blue',
    'tomorrow-night-bright',
    'tomorrow-night',
    'tomorrow-night-eighties',
    'vs',
    'xcode',
    'zenburn'
  ]

  var output = {}

  for (var i = 0; i < themes.length; ++i) {
    var css = fs.readFileSync('node_modules/highlight.js/styles/' + themes[i] + '.css').toString()
    var minified = new CleanCSS().minify(css).styles
    output[themes[i]] = minified
  }

  output = JSON.stringify(output).replace(/\'/g, '\\\'')

  var code = 'var themes = \'' + output + '\''

  fs.writeFileSync('scripts/themes.js', code)
}
