chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 900,
      'height': 600
    },
    frame: { type: "none" }
  });
});