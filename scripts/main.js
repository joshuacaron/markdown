newPage = function(){
  app.pages.push({
    "title":"untitled",
    "markdown":"Type in *Markdown* and see the result instantly."
  })
  if (app.pages.length>1){
    app.selected = app.pages.length -1;
  }
  else {
    app.selected = 0
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
        // case 'f':
        //     event.preventDefault();
        //     console.log('ctrl-f');
        //     break;
        // case 'g':
        //     event.preventDefault();
        //     console.log('ctrl-g');
        //     break;
        }
    }
});
});