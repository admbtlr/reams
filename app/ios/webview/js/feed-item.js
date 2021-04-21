function replaceSectionsWithDivs () {
  const sections = document.querySelector('article').querySelectorAll('section')
  let div
  for (var i = sections.length - 1; i >= 0; i--) {
    div = document.createElement('div')
    div.innerHTML = sections[i].innerHTML
    sections[i].parentNode.replaceChild(div, sections[i])
  }
}

function moveChildrenUpALevel (div) {
  var parent = div.parentNode
  var children = div.childNodes
  children.forEach(child => {
    parent.insertBefore(child.cloneNode(true), div)
  })
}

function removeDivsInDivs(divs) {
  divs = divs || document.querySelector('article').querySelectorAll('div')
  const toRemove = []
  let pointlessDivs = Array.from(divs).filter(hasOnlyDivChildren)

  while (pointlessDivs.length > 0) {
    moveChildrenUpALevel(pointlessDivs[0])
    pointlessDivs[0].remove()
    divs = document.querySelector('article').querySelectorAll('div')
    pointlessDivs = Array.from(divs).filter(hasOnlyDivChildren)
  }
}

function removeDivsWithImg(divs) {
  divs = divs || document.querySelector('article').querySelectorAll('div')
  const toRemove = []

  // this is a New York Times thing...
  divs.forEach(div => {
    if (div.childNodes.length > 1 && div.childNodes[0].nodeType === 3 &&
      div.childNodes[0].textContent === 'Image') {
      div.removeChild(div.childNodes[0])
    }
  })

  const hasOnlyImgChild = function (el) {
    return el.childNodes.length === 1 && el.childNodes[0].nodeType === 1 &&
    el.childNodes[0].tagName === 'IMG'
  }
  let divsWithImgs = Array.from(divs).filter(hasOnlyImgChild)
  while (divsWithImgs.length > 0) {
    moveChildrenUpALevel(divsWithImgs[0])
    divsWithImgs[0].remove()
    divs = document.querySelector('article').querySelectorAll('div')
    divsWithImgs = Array.from(divs).filter(hasOnlyImgChild)
  }
}

function hasOnlyDivChildren (el) {
  const children = getChildrenRemoveBlankTextNodes(el)
  if (children.length === 0) return false
  for (var i = 0; i < children.length; i++) {
    if (children[i].tagName !== 'DIV') return false
  }
  return true
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

function removeSoloSurroundingDivs () {
  const article = document.querySelectorAll('article')[0]
  let children = getChildrenRemoveBlankTextNodes(article)
  while (children.length === 1 && children[0].tagName === 'DIV') {
    children = getChildrenRemoveBlankTextNodes(children[0])
  }
  article.childNodes.forEach(node => {
    article.removeChild(node)
  })
  children.forEach(child => {
    article.appendChild(child)
  })
  // const nodeList = document.querySelectorAll('article > *')
  // if (nodeList.length === 1 && nodeList[0].tagName === 'DIV') {
  //   const div = nodeList[0]
  //   const childs = div.childNodes
  //   const article = document.querySelector('article')
  //   let toRemove = []
  //   for (var i = 0; i < childs.length; i++) {
  //     article.insertBefore(children[i].cloneNode(true), div)
  //     toRemove.push(children[i])
  //   }

  //   for (var i = toRemove.length - 1; i >= 0; i--) {
  //     toRemove[i].remove()
  //   }
  // }
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

function convertDivsToFigures () {
  const divs = document.querySelectorAll('div')
  Array.prototype.forEach.call(divs, function (div, i) {
    if (div.childNodes.length === 2 &&
      div.childNodes[0].tagName === 'IMG' &&
      (div.childNodes[1].tagName === 'P' ||
        div.childNodes[1].nodeType === 3)) {
      let figCaption = document.createElement('figcaption')
      figCaption.innerHTML = div.childNodes[1].textContent
      div.replaceChild(figCaption, div.childNodes[1])
      let figure = document.createElement('figure')
      figure.innerHTML = div.innerHTML
      div.parentNode.replaceChild(figure, div)
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
    const text = el.innerText
    if (text.length < 200) {
      el.classList.add('short-para')
    }
    if (text.trim().endsWith(':')) {
      el.classList.add('ends-with-colon')
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
    if (el.naturalHeight < 20 || el.naturalWidth < document.body.clientWidth * 0.6) {
      el.classList.add('img-small')
    }
  })
  const figures = document.querySelectorAll('figure')
  Array.prototype.forEach.call(figures, function (el, i) {
    if (el.getElementsByTagName('img').length > 0 &&
      el.getElementsByTagName('img')[0].classList.contains('img-small')) {
      el.classList.add('figure-small')
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
  window.setTimeout(() => {
    window.ReactNativeWebView.postMessage('resize:' + getHeight())
  }, 1000)

}

function getHeight () {
  return Math.ceil(document.querySelector('article').getBoundingClientRect().height)
}

function toggleDarkMode(isDarkMode) {
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
  var maxCaps = 15
  for (var i = 0; i < el.children.length; i++) {
    if (el.children[i].tagName === 'P') {
      var p = el.children[i]
      console.log(p)
      var childNodes = p.childNodes
      for (var j = 0; j < childNodes.length; j++) {
        if (childNodes[j].nodeType === 3) {
          childNodes[j].nodeValue = capitaliseText(childNodes[j].nodeValue, maxCaps)
          maxCaps -= childNodes[j].nodeValue.length
        } else if (childNodes[j].innerText.length > 0) {
          childNodes[j].innerText = capitaliseText(childNodes[j].innerText, maxCaps)
          maxCaps -= childNodes[j].innerText.length
        }
        if (maxCaps <= 0) break
      }
      break
    }
  }
}

function capitaliseText (text, maxCaps) {
  if (text.split(/[,\.;:\?!]/, 2)[0].length < maxCaps) {
    var splitted = text.split(/([,\.;:\?!])/)
    splitted[0] = splitted[0].toUpperCase()
    return splitted.join('')
  } else {
    var splitted = text.split(' ')
    let totalLength = 0
    return splitted.map((word, index) => {
      totalLength += word.length
      return totalLength < maxCaps ? word.toUpperCase() : word
    }).join(' ')
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
    if (bq.innerText.startsWith('“')) {
      bq.classList.add('is-quote')
    }
    if (bq.innerText.length > 200) return
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

function markQuoteBlockquotes() {
  var blockquotes = document.getElementsByTagName('blockquote')
  Array.prototype.forEach.call(blockquotes, function (bq) {
    if (bq.innerText.startsWith('“')) {
      bq.classList.add('is-quote')
    }
  })
}

function createFigCaptions () {
  var article = document.getElementsByTagName('article')[0]
  var nodes = article.childNodes
  var indexes = []
  nodes.forEach((node, index) => {
    if (index !== 0 && node.nodeType === 3 && node.nodeValue.trim().length !== 0) {
      indexes.push(index)
    }
  })

  indexes.forEach(index => {
    var node = nodes[index]
    var previous = nodes[index - 1]
    if (onlyContentIsImg(previous)) {
      var figure = document.createElement('figure')
      var figCaption = document.createElement('figcaption')
      if (previous.tagName === 'P') {
        figure.appendChild(previous.children[0])
      } else {
        figure.appendChild(previous.cloneNode(true))
      }
      figure.appendChild(figCaption)
      figCaption.appendChild(node.cloneNode(true))
      article.replaceChild(figure, node)
      article.replaceChild(document.createTextNode(' '), previous)
    }
  })
}

function onlyContentIsImg (node) {
  var children = getChildrenRemoveBlankTextNodes(node)
  if (children.length !== 1) {
    return false
  } else if (children[0].nodeType !== 1) {
    return false
  } else if (children[0].tagName === 'IMG') {
    return true
  } else {
    return onlyContentIsImg(children[0])
  }
}

function getChildrenRemoveBlankTextNodes (node) {
  return Array.from(node.childNodes)
    .filter(node => node.nodeType !== 3 || node.nodeValue.trim().length > 0)
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

function remove1pxImages() {
  Array.from(document.querySelectorAll('img'))
    .filter(img => img.getAttribute('height') === '1')
    .forEach(img => {
      img.remove()
    })
}

function removeWidows() {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    console.log(innerHtml)
  })
}

// obviously this doesn't work, cos it's the ScrollView that scrolls, not the WebView
function fadeIntoView() {
  console.log('fadeIntoView')
  var fadables = Array.from(document.querySelectorAll('figure'))
    .concat(Array.from(document.querySelectorAll('blockquote')))
  window.addEventListener('scroll', function(e) {
    console.log("We're scrolling!")
    fadables.forEach(function(fadable) {
      if (isInViewport(fadable)) {
        fadable.classList.add('in-viewport')
      }
    })
  }, false)
}

function addTapMessageToImages () {
  addTapMessageToElements('img', 'image:', 'src')
  // var images = document.querySelectorAll('img')
  // Array.prototype.forEach.call(images, function (image, i) {
  //   image.onclick = function (event) {
  //     window.postMessage('image:' + image.src)
  //   }
  // })
}

function addTapMessageToLinks () {
  addTapMessageToElements('a', 'link:', 'href')
}

function addTapMessageToElements (tag, msg, attr) {
  var els = document.querySelectorAll(tag)
  Array.prototype.forEach.call(els, function (el, i) {
    el.onclick = function (event) {
      window.ReactNativeWebView.postMessage(msg + el[attr])
      event.stopPropagation()
      event.preventDefault()
      return false
    }
  })
}

function removeNYTImageText () {
  removeNodes('figure div span')
}

function removeNodes (query) {
  const nodes = document.querySelectorAll(query)
  for (var i = nodes.length - 1; i >= 0; i--) {
    nodes[i].remove()
  }
}

function removeSrcSets () {
  const images = document.querySelectorAll('img')
  for (var i = images.length - 1; i >= 0; i--) {
    images[i].srcset = ''
  }
}

function stopAutoplay () {
  [].slice.call(document.getElementsByTagName('video')).forEach(v => v.removeAttribute('autoplay'))
}

// what?
replaceSectionsWithDivs()
removeDivsInDivs()
removeArticles()
removeEmptyParagraphs()
removeEmptyDivs()
removeDivsWithOrphanFigures()
markShortParagraphs()
markSingleCharParagraphs()
markShortBlockquotes()
markContentHoldingDivs()
// capitaliseFirstWords()
removeSourceTags()
removeFiguresWithoutImages()
markPullQuotes()
markQuoteBlockquotes()
removeAllBrs()
remove1pxImages()
removeNYTImageText()
removeNodes('time')
removeSoloSurroundingDivs()
createFigCaptions()
removeSrcSets()
removeEmptyDivs()
removeDivsWithImg()
convertDivsToFigures()
// removeWidows()

window.addEventListener("load", function() {
  markImages()
  addTapMessageToImages()
  // addTapMessageToLinks()
  removeAllBrs()
  stopAutoplay()
})
