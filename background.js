chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 1000,
      'height': 650
    },
    frame: { type: "none" } // Make own close buttons, etc.
  });


// Menu when right click on header
  chrome.contextMenus.create({
    title: "New",
    id: "context-new"
  });
  chrome.contextMenus.create({
    title: "Open",
    id: "context-open"
  });
  chrome.contextMenus.create({
    title: "Save",
    id: "context-save"
  });
  chrome.contextMenus.create({
    title: "Save As",
    id: "context-saveas"
  });
  chrome.contextMenus.create({
    title: "Settings",
    id: "context-settings"
  });
  chrome.contextMenus.create({
    title: "Close Current Tab",
    id: "context-close-current-tab"
  });
  chrome.contextMenus.create({
    title: "Exit",
    id: "context-exit"
  });


});
