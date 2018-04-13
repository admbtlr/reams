function replaceSectionsWithDivs () {
  const sections = document.querySelector('article').querySelectorAll('section')
  let div
  for (var i = sections.length - 1; i >= 0; i--) {
    div = document.createElement('div')
    div.innerHTML = sections[i].innerHTML
    sections[i].parentNode.replaceChild(div, sections[i])
  }
}

function removeDivsInDivs () {
  const divs = document.querySelector('article').querySelectorAll('div')
  const toRemove = []
  for (var i = divs.length - 1; i >= 0; i--) {
    var parent = divs[i].parentNode
    var nextSibling = divs[i].nextElementSibling
    var prevSibling = divs[i].prevElementSibling
    console.log(parent)
    if (parent.tagName === 'DIV' &&
      !parent.classList.contains('body') &&
      !nextSibling &&
      !prevSibling) {
      // move this up to a sibling of the parent
      var grandparent = parent.parentNode
      grandparent.insertBefore(divs[i].cloneNode(true), parent)
      toRemove.push(parent)
    }
  }

  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].remove()
  }
}

function removeArticles () {
  const articles = document.querySelector('article').querySelectorAll('article')
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i]
    var children = article.childNodes
    var parent = article.parentNode
    for (var j = 0; j < children.length; j++) {
      parent.insertBefore(children[j].cloneNode(true), article)
    }
    article.remove()
  }
}

function removeSoloSurroundingDiv () {
  const nodeList = document.querySelectorAll('article > *')
  if (nodeList.length === 1 && nodeList[0].tagName === 'DIV') {
    const div = nodeList[0]
    const children = div.childNodes
    const article = document.querySelector('article')
    let toRemove = []
    for (var i = 0; i < children.length; i++) {
      article.insertBefore(children[i].cloneNode(true), div)
      toRemove.push(children[i])
    }

    for (var i = toRemove.length - 1; i >= 0; i--) {
      toRemove[i].remove()
    }
  }
}

function removeDivsWithOrphanFigures () {
  const figures = document.querySelectorAll('figure')
  Array.prototype.forEach.call(figures, function (figure, i) {
    const parent = figure.parentNode
    if (parent.tagName == 'DIV' && parent.childElementCount === 1) {
      parent.parentNode.insertBefore(figure.cloneNode(true), parent)
      parent.remove()
    }
  })
}

function removeEmptyParagraphs () {
  const paras = document.querySelectorAll('p')
  let toRemove = []
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.innerText.trim().length === 0 &&
      el.childElementCount === 0) {
      toRemove.push(el)
    }
  })

  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].remove()
  }
}

function removeEmptyDivs () {
  const divs = document.querySelectorAll('div')
  let toRemove = []
  Array.prototype.forEach.call(divs, function (el, i) {
    if (el.innerText.trim().length === 0 &&
      el.childElementCount === 0) {
      toRemove.push(el)
    }
  })

  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].remove()
  }
}

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
  const article = document.querySelector('article')
  capitaliseFirstChildP(article)
  const divs = document.getElementsByTagName('div')
  Array.prototype.forEach.call(divs, capitaliseFirstChildP)
}

function capitaliseFirstChildP(el) {
  if (!el.children) {
   return
  }
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
      if (prevPara.substring(prevPara.length - 1) !== ':') {
        bq.classList.add('pullquote')
      }
    }
  })
}

function removeAllBrs() {
  var brs = document.getElementsByTagName('br')
  let toRemove = []
  for (var i = brs.length - 1; i >= 0; i--) {
    toRemove.push(brs[i])
  }
  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].remove()
  }
}

function removeWidows() {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    console.log(innerHtml)
  })
}

// what?
replaceSectionsWithDivs()
for (var i = 0; i < 5; i++) {
  removeDivsInDivs()
}
removeArticles()
removeSoloSurroundingDiv()
removeEmptyParagraphs()
removeEmptyDivs()
removeDivsWithOrphanFigures()
markShortParagraphs()
markShortBlockquotes()
markContentHoldingDivs()
capitaliseFirstWords()
removeSourceTags()
removeFiguresWithoutImages()
markPullQuotes()
removeAllBrs()
// removeWidows()

window.onload = function() {
  markImages()
  removeAllBrs()
}

// }
