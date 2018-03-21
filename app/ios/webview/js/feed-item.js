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

function markQuoteBlockquotes() {
  const paras = document.querySelectorAll('blockquote')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (prev.innerText.trim().substr(-1) == ':') {
      el.classList.add('quote-blockquote')
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

function capitaliseFirstWords() {
  const divs = document.getElementsByTagName('div')
  Array.prototype.forEach.call(divs, function (el) {
    if (el.children) {
      for (var i = 0; i < el.children.length; i++) {
        if (el.children[i].tagName === 'P') {
          var p = el.children[i]
          console.log(p)
          var childNodes = p.childNodes
          for (var j = 0; j < childNodes.length; j++) {
            if (childNodes[j].nodeType === 3) {
              var text = childNodes[j].nodeValue
              if (text.split(/[,\.;:\?!]/, 2)[0].length < 25) {
                var splitted = text.split(/([,\.;:\?!])/)
                splitted[0] = splitted[0].toUpperCase()
                childNodes[j].nodeValue = splitted.join('')
              } else {
                var splitted = text.split(' ')
                let totalLength = 0
                childNodes[j].nodeValue = splitted.map((word, index) => {
                  totalLength += word.length
                  return totalLength < 18 ? word.toUpperCase() : word
                }).join(' ')
              }
              break
            }
          }
          break
        }
      }
    }
  })
}

function removeSourceTags() {
  var sources = document.getElementsByTagName('source')
  for (var i = sources.length - 1; i >= 0; i--) {
    sources[i].remove()
  }
}

function removeFiguresWithoutImages() {
  var figures = document.getElementsByTagName('figure')
  for (var i = figures.length - 1; i >= 0; i--) {
    if (figures[i].getElementsByTagName('img').length === 0) {
      figures[i].remove()
    }
  }
}

function markPullQuotes() {
  var blockquotes = document.getElementsByTagName('blockquote')
  Array.prototype.forEach.call(blockquotes, function (bq) {
    var sibling = bq.previousElementSibling ||
      bq.parentElement.previousElementSibling
    if (sibling && sibling.innerText) {
      var prevPara = sibling.innerText
      if (prevPara.substring(prevPara.length - 2) !== ':') {
        bq.classList.add('pullquote')
      }
    }
  })
}

function removeAllBrs() {
  var brs = document.getElementsByTagName('br')
  for (var i = brs.length - 1; i >= 0; i--) {
    brs[i].remove()
  }
}

window.onload = function () {
  markShortBlockquotes()
  markShortParagraphs()
  markImages()
  markContentHoldingDivs()
  capitaliseFirstWords()
  removeSourceTags()
  removeFiguresWithoutImages()
  markPullQuotes()
  removeAllBrs()
}
