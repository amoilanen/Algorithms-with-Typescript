// On the index/preface page, display just the book title without the chapter prefix
(function() {
  var path = window.location.pathname;
  if (path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('/preface.html')) {
    document.title = 'Algorithms with TypeScript';
  }
})();
