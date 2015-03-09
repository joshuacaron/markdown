var previousDocuments, openDocuments = [];

newPage = function(){
  app.pages.push({
    "markdown":"Markdown Overview\n\
=================\n\
\n\
Welcome to **Markdown**. Everything you write is displayed formatted in the right pane. *Click* on the right pane to copy the formatted text as HTML.\n\
\n\
Options\n\
-----------\n\
- You can format text as *italics* or **bold**.\n\
- List can be made with numbers or bullets.\n\
- [Links](http://www.google.ca) can also be added.\n\
\n\
There are a number of useful keyboard shortcuts too:\n\
\n\
1. *Ctrl+n/Ctrl+t*: Create a new tab.\n\
1. *Ctrl+o*: Open a file.\n\
1. *Ctrl+s/Ctrl+Shift+s*: Save/save as a file.\n\
1. *Ctrl+p*: Print the current tab.\n\
1. *Ctrl+w*: Close the current tab.\n\
1. *Ctrl+Tab*: Cycle through the tabs.\n\
\n\
Happy Writing!",
    "path":""
  })
  if (app.pages.length>1){
    app.selected = app.pages.length -1;
  }
  else {
    app.selected = 0
  }
}

closeTab = function(){
  removeFromOpenDocuments(app.pages[app.selected].file);
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

printFile = function(){
  console.log("printing");
  var iframe = document.createElement("iframe");
  var doc = markdown.toHTML(app.pages[app.selected].markdown);
  iframe.srcdoc = doc;
  iframe.width = iframe.height = 1;
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  setTimeout(function() {
    iframe.contentWindow.print();
    setTimeout(function() {
      iframe.remove();
    });
  });
}

errorHandler = function(e){
  console.log(e);
}

cycleTabs = function(){
  if (app.pages.length-app.selected>1){
    app.selected += 1;
  }
  else if (app.pages.length-app.selected==1 && app.pages.length>1){
    app.selected = 0;
  }
}

saveAs = function(){
  console.log("saving as");
    chrome.fileSystem.chooseEntry({type: 'saveFile'}, function(writableFileEntry) {
      app.pages[app.selected].file = writableFileEntry;
    writableFileEntry.createWriter(function(writer) {
      console.log("started writing");
      writer.onerror = errorHandler;
      writer.onwriteend = function(e) {
        if (writer.length === 0) {
            //fileWriter has been reset, write file
            writer.write(new Blob([app.pages[app.selected].markdown], {type: 'text/plain'}));
            app.pages[app.selected].lastSave = app.pages[app.selected].markdown;
            addToOpenDocuments(writableFileEntry);
            // console.log(app.pages[app.selected]);
        } else {
            //file has been overwritten with blob
            //use callback or resolve promise
        }
    };
    writer.truncate(0);
    }, errorHandler);
  });
}

removeFromOpenDocuments = function(x){
  id = chrome.fileSystem.retainEntry(x);
  n = openDocuments.indexOf(id);
  openDocuments.splice(n,1);
  console.log(openDocuments);
  chrome.storage.local.set({'openDocuments': openDocuments}, function() {
    // Notify that we saved.
    console.log('openDocuments saved (remove)');
  });
}

addToOpenDocuments = function(x){
  id = chrome.fileSystem.retainEntry(x);
  openDocuments.push(id);
  console.log(openDocuments);
  chrome.storage.local.set({'openDocuments': openDocuments}, function() {
    // Notify that we saved.
    console.log('openDocuments saved (add)');
  });
}

restoreOldDocuments = function(){
  var restore = false;
  chrome.storage.local.get('openDocuments',function(e){
    if(e.openDocuments){
      previousDocuments = e.openDocuments;
    }
    for(i=0;i<previousDocuments.length;++i){
      chrome.fileSystem.restoreEntry(previousDocuments[i],function(readOnlyEntry){
        readOnlyEntry.file(function(file) {
          var reader = new FileReader();

          reader.onerror = errorHandler;
          reader.onloadend = function(e) {
            // console.log(e.target.result);
            app.pages.push({"markdown": e.target.result, "lastSave":e.target.result});
            app.selected = app.pages.length - 1;
            app.pages[app.selected].file = readOnlyEntry;
            addToOpenDocuments(readOnlyEntry);
            restore = true;
          };

          reader.readAsText(file);
        });
      })
    }
    setTimeout(function(){
      if(restore==false){
        newPage();
      }
    },500);


  })
}

saveFile = function(){
  if(app.pages[app.selected].file) {
    writableFileEntry = app.pages[app.selected].file;
    writableFileEntry.createWriter(function(writer) {
      writer.onerror = errorHandler;
    writer.onwriteend = function() {
        if (writer.length === 0) {
            //fileWriter has been reset, write file
            writer.write(new Blob([app.pages[app.selected].markdown], {type: 'text/plain'}));
            app.pages[app.selected].lastSave = app.pages[app.selected].markdown;
            // console.log(app.pages[app.selected]);
        } else {
            //file has been overwritten with blob
            //use callback or resolve promise
        }
    };
    writer.truncate(0);
    }, errorHandler);
  }
  else {
    saveAs();
  }
}

openFile = function(){
  var chosenFileEntry = null;
  chrome.fileSystem.chooseEntry({type: 'openWritableFile'}, function(readOnlyEntry) {
    readOnlyEntry.file(function(file) {
      var reader = new FileReader();

      reader.onerror = errorHandler;
      reader.onloadend = function(e) {
        // console.log(e.target.result);
        app.pages.push({"markdown": e.target.result, "lastSave":e.target.result});
        app.selected = app.pages.length - 1;
        app.pages[app.selected].file = readOnlyEntry;
        addToOpenDocuments(readOnlyEntry);
      };

      reader.readAsText(file);
    });
	});
}

document.addEventListener('DOMContentLoaded', function(){
  app = document.querySelector("#auto-bind");
  app.selected=0;
  app.pages = [];
  restoreOldDocuments();

  app.makeTitle = function(markdown,file,lastSave,page){
    path = "";
    if(page.file){
      path=page.file.name;
    }

    if(path!="" && page.lastSave==page.markdown){
      return path;
    }
    else if(path!=""){
      return "<em>" + path + "*</em>";
    }
    else{
      return "<em>untitled*</em>";
    }
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
      if (event.shiftKey && String.fromCharCode(event.which).toLowerCase() =='s'){
        saveAs();
      }
      if (event.which==9){// Ctrl + Tab
        event.preventDefault();
        cycleTabs();
      }
        switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
            event.preventDefault();
            console.log('ctrl-s');
            saveFile();
            break;
        case 'p':
            event.preventDefault();
            printFile();
            break;
        case 'n':
            event.preventDefault();
            newPage();
            break;
        case 'o':
            event.preventDefault();
            openFile();
            break;
        case 't':
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