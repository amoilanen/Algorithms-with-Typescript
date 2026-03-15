// On the index/preface page, display just the book title without the chapter prefix
// Also update Open Graph title to match for social sharing consistency
(function() {
  var path = window.location.pathname;
  if (path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('/preface.html')) {
    var bookTitle = 'Algorithms with TypeScript';
    document.title = bookTitle;

    // Update og:title meta tag to match
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', bookTitle);
    }

    // Update twitter:title meta tag to match
    var twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', bookTitle);
    }
  }
})();
