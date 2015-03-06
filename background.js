chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('build.html', {
    'bounds': {
      'width': 900,
      'height': 600
    }
  });
});