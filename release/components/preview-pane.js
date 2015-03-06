    Polymer('preview-pane', {
      eventDelegates: {
        click: "onClick"
      },
      markdown:"",
      convert:function(x){
        markdown.toHTML(x);
      },
      onClick: function(){
        var copyFrom = $('<textarea/>');
        copyFrom.text(markdown.toHTML(this.markdown));
        $('body').append(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        copyFrom.remove();
      },
      markdownChanged:function(x,y){
        this.injectBoundHTML(markdown.toHTML(this.markdown),this.$.preview);
      }
    });
