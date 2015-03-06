newPage = function(){
  app.pages.push({
    "title":"untitled",
    "markdown":"Type in *Markdown* and see the result **instantly**."
  })
  if (app.pages.length>1){
    app.selected = app.pages.length -1;
  }
  else {
    app.selected = 0
  }
}

closeTab = function(){
  if (app.pages.length>1 && app.selected==app.pages.length-1){
    app.pages.splice(app.selected,1);
    app.selected=app.pages.length-1;
  }
  else if (app.pages.length>1){
    app.pages.splice(app.selected,1);
  }
  else {
    window.close();
  }
}

saveAs = function(){
  chrome.fileSystem.chooseEntry({type:"saveFile", suggestedName:"testing.txt"}, function(entry, array){
        save(entry, blob); /*the blob was provided earlier*/
    });

  function save(fileEntry, content) {
    fileEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function(e) {
        fileWriter.onwriteend = null;
        fileWriter.truncate(content.size);
      };
      fileWriter.onerror = function(e) {
        console.log('Write failed: ' + e.toString());
      };
      var blob = new Blob(['yoloswag'], {'type': 'text/plain'});
      fileWriter.write(blob);
    }, errorHandler);
  }
}

document.addEventListener('DOMContentLoaded', function(){
  app = document.querySelector("#auto-bind");
  app.selected=0;
  app.pages = [];
  newPage();

  app.makeTitle = function(x){
    y = x.split("\n");
    return y[0];
  }

  var cw = document.getElementById("closeWindow");;
  cw.addEventListener("click",function(){
    // chrome.app.window.current().close;
    window.close();
  })

    var elem = document.getElementById('fab');
    elem.addEventListener('click',function(){
      newPage();
    });

    $(window).bind('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
            event.preventDefault();
            console.log('ctrl-s');
            saveAs();
            break;
        case 'n':
            event.preventDefault();
            newPage();
            break;
        case 'w':
            event.preventDefault();
            closeTab();
            break;
        }
    }
});
});