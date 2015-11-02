var editor;
var katex = require('parse-katex');
var hljs = require('highlight.js');
var css = require('css');

Polymer('markdown-editor', {
  syncScrollSetting: true,
  renderKaTeX: false,
  renderKaTeXChanged: function() {
    this.updatePreview();
  },
  markdown: '',
  useMaruku: false,
  highlightSyntax: false,
  customCSS: '',
  theme: '',
  themes: JSON.parse(themes),
  themeNumber: 0,

  customCSSChanged: function() {
    this.parseCSS(this.customCSS);
  },

  highlightSyntaxChanged: function() {
    this.updateHighlighting()
  },

  themeNumberChanged: function(){
    this.updateHighlighting()
  },

  updateHighlighting: function() {
    this.updatePreview();
    this.theme = this.themes[Object.keys(this.themes)[parseInt(this.themeNumber)]]
  },

  useMarukuChanged: function() {
    this.updatePreview();
  },

  convertMarkdown: function(x) {
    if (this.useMaruku === true) {
      return markdown.toHTML(x,'Maruku');
    } else {
      return markdown.toHTML(x);
    }
  },

  highlightCode: function(html) {
    // Split <pre><code> tags and highlight any code.
    var parsedHtml = splitHtml(html, 'pre')
    for (var i = 1; i < parsedHtml.length; i += 2) {
      var code = parsedHtml[i].slice(11, -13);
      parsedHtml[i] = '<pre><code class="hljs">' + hljs.highlightAuto(code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')).value + '</code></pre>';
    }
    parsedHtml = parsedHtml.join('')
    return parsedHtml
  },

  updatePreview: function() {
    if (this.renderKaTeX === true && this.highlightSyntax === true) {
      this.injectBoundHTML(this.highlightCode(katex.renderLaTeX(this.convertMarkdown(this.markdown))), this.$.preview);
    } else if (this.renderKaTeX === true) {
      this.injectBoundHTML(katex.renderLaTeX(this.convertMarkdown(this.markdown)), this.$.preview);
    } else if (this.highlightSyntax === true) {
      this.injectBoundHTML(this.highlightCode(this.convertMarkdown(this.markdown)), this.$.preview);
    } else {
      this.injectBoundHTML(this.convertMarkdown(this.markdown), this.$.preview);
    }

    var cursor = this.$.markdown.selectionStart;
    var n = this.markdown.length;
    var secondLast = this.markdown.slice(n - 2, n - 1);
    if (cursor === n && secondLast === '\n') {
      $(this.$.markdown).scrollTop(this.$.markdown.scrollHeight);
      if (this.syncScrollSetting === true) {
        $(this.$.preview).scrollTop(this.$.preview.scrollHeight);
      }
    }
  },

  markdownChanged: function() {
    this.updatePreview();
  },

  syncScroll: function() {
    if (this.syncScrollSetting === true) {
      var wrapperHeight = this.$.markdown.style.height;
      var innerHeight = this.$.markdown.scrollHeight;
      var previewHeight = this.$.preview.scrollHeight;
      var ratio = (innerHeight - wrapperHeight) / (previewHeight - wrapperHeight);
      var previewPosition = $(this.$.markdown).scrollTop() * ratio;
      $(this.$.preview).scrollTop(previewPosition);
    }
  },
  markdownFont: function(value) {
    if (value === true) {
      return 'Droid Sans Mono';
    } else {
      return 'Open Sans';
    }
  },

  parseCSS: function(originalCSS) {
    // Parse the css and make the selectors apply only to the preview pane
    var parsedCSS = css.parse(originalCSS, {silent: true});
    var rules = parsedCSS.stylesheet.rules;
    for (var i = 0; i < rules.length; ++i) {
      var sel = rules[i].selectors;
      for (var j = 0; j < sel.length; ++j) {
        sel[j] = '#preview ' + sel[j]
      }
      rules[i].selectors = sel;
    }
    parsedCSS.stylesheet.rules = rules;
    var newCSS = css.stringify(parsedCSS);
    // Inject the css into the page
    this.injectBoundHTML(newCSS, this.$.customStyle)
  },

  copyPreview: function() {
    var copyFrom = $('<textarea/>');
    copyFrom.text(this.convertMarkdown(editor.markdown));
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    copyFrom.remove();
    document.querySelector('#toast').show();
  },
  ready: function() {
    editor = this;
    this.$.preview.addEventListener('click',this.copyPreview.bind(this));
    this.$.markdown.addEventListener('scroll',this.syncScroll.bind(this));

    this.$.markdown.addEventListener('keydown', function(e) {
      var keyCode = e.keyCode || e.which;

      if (keyCode === 9) {
        e.preventDefault();
        var start = $(this).get(0).selectionStart;
        var end = $(this).get(0).selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start) + '    ' + $(this).val().substring(end));

        // put caret at right position again
        $(this).get(0).selectionStart =
        $(this).get(0).selectionEnd = start + 4;
      }
    });
  }
});
