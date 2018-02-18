function markShortParagraphs () {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.innerText.length < 200) {
      el.classList.add('short-para')
    }
  })
}

function markSingleCharParagraphs () {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.innerText.length === 1) {
      el.classList.add('single-char-para')
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

function markContentHoldingDivs() {
  const divs = document.querySelectorAll('div')
  let isContentHolder
  let n = 0
  Array.prototype.forEach.call(divs, function (el) {
    isContentHolder = false
    if (el.children) {
      for (var i = 0; i < el.children.length; i++) {
        if (el.children[i].tagName === 'P') {
          isContentHolder = true
          break
        }
      }
    }
    if (isContentHolder) {
      el.classList.add('content-holder')
      if (!!(n++ % 2)) {
        el.classList.add('alternating')
      }
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

function setFontSize (fontSize) {
  const html = document.getElementsByTagName('html')[0]
  let fontSizeClass
  html.classList.forEach((c) => {
    if (c.substring(0, 9) === 'font-size') {
      fontSizeClass = c
    }
  })
  html.classList.remove(fontSizeClass)
  html.classList.add(`font-size-${fontSize}`)
}

function toggleDarkBackground(isDarkBackground) {
  const html = document.getElementsByTagName('html')[0]
  html.classList.toggle('dark-background')
}

window.onload = function () {
  markShortBlockquotes()
  markShortParagraphs()
  markImages()
  markContentHoldingDivs()
}
