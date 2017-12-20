function markShortParagraphs () {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.innerText.length < 200) {
      el.classList.add('short-para')
    }
  })
}

function markImages () {
  const imgs = document.querySelectorAll('img')
  Array.prototype.forEach.call(imgs, function (el, i) {
    if (el.naturalHeight > el.naturalWidth) {
      el.classList.add('img-portrait')
    }
    if (el.naturalHeight < 20) {
      el.classList.add('img-small')
    }
  })
}

function markShortBlockquotes() {
  const paras = document.querySelectorAll('blockquote')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.innerText.length < 100) {
      el.classList.add('short-blockquote')
    }
  })
}

var toggleCollapsed = (e) => {
  var expander = document.querySelectorAll('.js-feed-title')[0]
  if (expander.classList.contains('collapsed')) {
    expander.classList.remove('collapsed')
  } else {
    expander.classList.add('collapsed')
  }
}

window.onload = function () {
  markShortBlockquotes()
  markShortParagraphs()
  markImages()

  var expander = document.querySelectorAll('.js-feed-expand')
  document.querySelectorAll('.js-feed-expand')[0].ontouchend = toggleCollapsed
}
