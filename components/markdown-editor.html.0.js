
    Polymer('markdown-editor', {
      markdown:"Type in *Markdown* and see the result **instantly**.",
      markdownChanged:function(x,y){
        this.injectBoundHTML(markdown.toHTML(this.markdown),this.$.preview);
        // this.fire('markdown-updated',{
        //   "markdown":this.markdown
        // })
      }
    });
