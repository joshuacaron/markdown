var openDocuments = [];
var previousDocuments = [];
var asTimer = "";
var app;

var newPage = function(){
  app.pages.push({
    "markdown":"Markdown Overview\n\
=================\n\
\n\
Welcome to **Markdown**. \n\
\n\
- Everything you write is instantly formatted.\n\
- *Click* on the right pane to copy the formatted text as HTML.\n\
- The rest of the formatting options can be seen here: `https://daringfireball.net/projects/markdown/`\n\
\n\
Right click on the tabs bar to see the menu. There are a number of useful keyboard shortcuts:\n\
\n\
1. *Ctrl+k*: Open settings (can change font size, render math, etc.)\n\
1. *Ctrl+n/Ctrl+t*: Create a new tab.\n\
1. *Ctrl+o*: Open a file.\n\
1. *Ctrl+s/Ctrl+Shift+s*: Save/save as a file.\n\
1. *Ctrl+p*: Print the current tab (or save as pdf).\n\
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

var closeTab = function(){
  if(app.pages[app.selected].file){
    removeFromOpenDocuments(app.pages[app.selected].file);
  }
  if (app.pages.length > 1 && app.selected === app.pages.length - 1){
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

var printFile = function(){
  // append invisible iframe with formatted html to print only that
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

var errorHandler = function(e){
  throw new Error(e);
}

var cycleTabs = function(){
  if (app.pages.length-app.selected>1){
    app.selected += 1;
  }
  else if (app.pages.length-app.selected===1 && app.pages.length>1){
    app.selected = 0;
  }
}

var saveAs = function(){
  console.log("saving as");
  if(app.pages[app.selected].file){
    var prevDocument = app.pages[app.selected].file;
  }
    chrome.fileSystem.chooseEntry({type: 'saveFile'}, function(writableFileEntry) {
      app.pages[app.selected].file = writableFileEntry;
    writableFileEntry.createWriter(function(writer) {
      writer.onerror = errorHandler;
      writer.onwriteend = function(e) {
        if (writer.length === 0) {
            writer.write(new Blob([app.pages[app.selected].markdown], {type: 'text/plain'}));
            app.pages[app.selected].lastSave = app.pages[app.selected].markdown;
            addToOpenDocuments(writableFileEntry);
            if(prevDocument){
              // Removes previous name so doesn't open both
              removeFromOpenDocuments(prevDocument);
            }
        }
    };
    writer.truncate(0);
    }, errorHandler);
  });
}

var removeFromOpenDocuments = function(x){
  var id = chrome.fileSystem.retainEntry(x);
  var n = openDocuments.indexOf(id);
  openDocuments.splice(n,1);
  chrome.storage.local.set({'openDocuments': openDocuments}, function() {
  });
}

var addToOpenDocuments = function(x){
  var id = chrome.fileSystem.retainEntry(x);
  openDocuments.push(id);
  chrome.storage.local.set({'openDocuments': openDocuments}, function() {
  });
}

var restoreOldDocuments = function(){
  var restore = false;
  chrome.storage.local.get('openDocuments',function(e){
    if(e.openDocuments){
        previousDocuments = e.openDocuments;
        for(var i = 0; i < previousDocuments.length; ++i){
          chrome.fileSystem.restoreEntry(previousDocuments[i],function(readOnlyEntry){
            openFileHelper(readOnlyEntry,function(){
              restore = true;
            })
          })
        }
        setTimeout(function(){
          if(restore===false){
            newPage();
          }
        },500);
    }
    else {
      console.log("no documents found to restore");
      newPage();
    }


  })
}

var saveFile = function(){
  if(app.pages[app.selected].file) {
    var writableFileEntry = app.pages[app.selected].file;
    writableFileEntry.createWriter(function(writer) {
      writer.onerror = errorHandler;
    writer.onwriteend = function() {
        if (writer.length === 0) {
            writer.write(new Blob([app.pages[app.selected].markdown], {type: 'text/plain'}));
            app.pages[app.selected].lastSave = app.pages[app.selected].markdown;
        }
    };
    writer.truncate(0);
    }, errorHandler);
  }
  else {
    saveAs();
  }
}

var saveHelper = function(j){
  if(app.pages[j].file) {
    var writableFileEntry = app.pages[j].file;
    writableFileEntry.createWriter(function(writer) {
      writer.onerror = errorHandler;
    writer.onwriteend = function() {
        if (writer.length === 0) {
            writer.write(new Blob([app.pages[j].markdown], {type: 'text/plain'}));
            app.pages[j].lastSave = app.pages[j].markdown;
        }
    };
    writer.truncate(0);
    }, errorHandler);
  }
}

var openFile = function(){
  chrome.fileSystem.chooseEntry({type: 'openWritableFile'}, function(readOnlyEntry) {
    openFileHelper(readOnlyEntry);
	});
}

var openFileHelper = function(fileEntry,whenDone){
  fileEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = errorHandler;
    reader.onloadend = function(e) {
      app.pages.push({"markdown": e.target.result, "lastSave":e.target.result});
      app.selected = app.pages.length - 1;
      app.pages[app.selected].file = fileEntry;
      addToOpenDocuments(fileEntry);
      if(whenDone && (typeof whenDone === 'function')){
        whenDone();
      }
    };

    reader.readAsText(file);
  });
}

var loadSettings = function(){
  var defaultSettings = {
    syncedScrolling : true,
    alwaysOnTop: false,
    fontSize: "16px",
    monospaceFont : false,
    autosaveEnabled : false,
    autosaveInterval : "5",
    renderLaTeX: false,
    useMaruku: false,
    highlightingTheme: "44"
  }

  chrome.storage.local.get('settings',function(e){
    if(e.settings){
      app.settings = e.settings;
      console.log("found settings to restore");

      _.each(defaultSettings,function(value,index){
        if (!app.settings[index]){
          app.settings[index] = value;
        }
      })
    }
    else {
      app.settings = defaultSettings;
    }
  });
}

var saveSettings = function(){
  chrome.storage.local.set({'settings':app.settings},function(){
    
  });
}


var openSettings = function(){
  var settingsOpen = false;
  for(var i = 0; i < app.pages.length; ++i){
    if(app.pages[i].settings === true){
      app.selected = i;
      settingsOpen = true;
    }
  }
  if(settingsOpen === false){
    app.pages.push({
      "settings":true
    })
    app.selected = app.pages.length -1;
  }

}

var autosave = function(){
  if(app.settings.autosaveEnabled === true){
    asTimer = setInterval(function(){
      console.log("autosaving");

      for(var i = 0; i < app.pages.length; ++i){
        if(app.pages[i].file){
          saveHelper(i);
        }
      }

    },app.settings.autosaveInterval*60000)
  }
}

document.addEventListener('DOMContentLoaded', function(){
  app = document.querySelector("#auto-bind");

  app.selected=0;
  app.pages = [];

  restoreOldDocuments();

  loadSettings();

  app.makeTitle = function(markdown,file,lastSave,page){
    var path = "";
    if(page.file){
      path=page.file.name;
    }

    if(path !== "" && page.lastSave === page.markdown){
      return path;
    }
    else if(path !== ""){
      return "<em>" + path + "*</em>";
    }
    else{
      return "<em>untitled*</em>";
    }
  }

  var cw = document.getElementById("closeWindow");
  cw.addEventListener("click",function(){
    window.close();
  })

    var elem = document.getElementById('fab');
    elem.addEventListener('click',function(){
      newPage();
    });

    var dnd = new DnDFileController('body', function(data) {
      for (var i=0;i<data.items.length;++i){
        var item = data.items[i];
        if (item.kind === 'file' && item.webkitGetAsEntry()) {
          var draggedEntry = data.items[i].webkitGetAsEntry();
          chrome.fileSystem.getWritableEntry(draggedEntry,function(writableEntry){
            openFileHelper(writableEntry);
          })
        }
      }
    });

    document.addEventListener("autosave-update",function(){
      clearInterval(asTimer);
      autosave();
    });

    document.addEventListener("settings-changed",function(){
      saveSettings();
    });

    $(window).bind('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
      if (event.shiftKey && String.fromCharCode(event.which).toLowerCase() === 's'){ // Ctrl + Shift + s
        saveAs();
      }
      if (event.which === 9){// Ctrl + Tab
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
        case 'k':
            event.preventDefault();
            openSettings();
            break;
        }
    }
  });

  // Link context menus to functions
  chrome.contextMenus.onClicked.addListener(function(itemData) {
    switch (itemData.menuItemId){
      case 'context-settings':
        openSettings();
        break;
      case 'context-open':
        openFile();
        break;
      case 'context-save':
        saveFile();
        break;
      case 'context-saveas':
        saveAs();
        break;
      case 'context-close-current-tab':
        closeTab();
        break;
      case 'context-new':
        newPage();
        break;
      case 'context-exit':
        window.close();
        break;
    }
  });
});