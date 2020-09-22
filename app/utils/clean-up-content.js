const jsdom = require("jsdom")

const { JSDOM } = jsdom

export default cleanUpContent = (content) => {
  const { document } = (new JSDOM(content)).window
  document = replaceSectionsWithDivs(document)
  document = removeDivsInDivs(document)
  document = removeArticles(document)
  document = removeEmptyParagraphs(document)
  document = removeEmptyDivs(document)
  document = removeDivsWithOrphanFigures(document)
  document = markShortParagraphs(document)
  document = markSingleCharParagraphs(document)
  document = markShortBlockquotes(document)
  // document = markContentHoldingDivs(document)
  // document = capitaliseFirstWords(document)
  document = removeSourceTags(document)
  document = removeFiguresWithoutImages(document)
  document = markPullQuotes(document)
  document = markQuoteBlockquotes(document)
  document = removeAllBrs(document)
  document = remove1pxImages(document)
  document = removeNYTImageText(document)
  document = removeNodes('time', document)
  document = removeSoloSurroundingDivs(document)
  document = createFigCaptions(document)
  document = removeSrcSets(document)
  document = removeEmptyDivs(document)
  document = removeDivsWithImg(document)
  document = convertDivsToFigures(document)
  // document = removeWidows(document)
  return document.documentElement.outerHTML
}

export function replaceSectionsWithDivs (document) {
  const sections = document.querySelector('article').querySelectorAll('section')
  let div
  for (var i = sections.length - 1; i >= 0; i--) {
    div = document.createElement('div')
    div.innerHTML = sections[i].innerHTML
    sections[i].parentNode.replaceChild(div, sections[i])
  }
}

export function moveChildrenUpALevel (div) {
  var parent = div.parentNode
  var children = div.childNodes
  children.forEach(child => {
    parent.insertBefore(child.cloneNode(true), div)
  })
}

export function removeDivsInDivs(document) {
  divs = document.querySelector('article').querySelectorAll('div')
  const toRemove = []
  let pointlessDivs = Array.from(divs).filter(hasOnlyDivChildren)
  
  while (pointlessDivs.length > 0) {
    moveChildrenUpALevel(pointlessDivs[0])
    pointlessDivs[0].remove()
    divs = document.querySelector('article').querySelectorAll('div')
    pointlessDivs = Array.from(divs).filter(hasOnlyDivChildren)
  }
}

export function removeDivsWithImg(document) {
  divs = document.querySelector('article').querySelectorAll('div')
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

export function removeArticles (document) {
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

export function removeSoloSurroundingDivs (document) {
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

export function removeDivsWithOrphanFigures (document) {
  const figures = document.querySelectorAll('figure')
  Array.prototype.forEach.call(figures, function (figure, i) {
    const parent = figure.parentNode
    if (parent.tagName == 'DIV' && parent.childElementCount === 1) {
      parent.parentNode.insertBefore(figure.cloneNode(true), parent)
      parent.remove()
    }
  })
}

export function convertDivsToFigures (document) {
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
  
export function removeEmptyParagraphs (document) {
  const paras = document.querySelectorAll('p')
  let toRemove = []
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.textContent.trim().length === 0 &&
    el.childElementCount === 0) {
      toRemove.push(el)
    }
  })
  
  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].remove()
  }
}

export function removeEmptyDivs (document) {
  const divs = document.querySelectorAll('div')
  let toRemove = []
  Array.prototype.forEach.call(divs, function (el, i) {
    if (el.textContent.trim().length === 0 &&
    el.childElementCount === 0) {
      toRemove.push(el)
    }
  })
  
  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].remove()
  }
}

export function markShortParagraphs (document) {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.textContent.length < 200) {
      el.classList.add('short-para')
    }
  })
}

export function markSingleCharParagraphs (document) {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.textContent.length === 1) {
      el.classList.add('single-char-para')
    }
  })
}

export function markShortBlockquotes(document) {
  const paras = document.querySelectorAll('blockquote')
  Array.prototype.forEach.call(paras, function (el, i) {
    if (el.textContent.length < 100) {
      el.classList.add('short-blockquote')
    }
  })
}

// unused
export function markContentHoldingDivs(document) {
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

export function capitaliseFirstWords(document) {
  const article = document.querySelector('article')
  capitaliseFirstChildP(article)
  const divs = document.getElementsByTagName('div')
  Array.prototype.forEach.call(divs, capitaliseFirstChildP)
}

export function capitaliseFirstChildP(el) {
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
        } else if (childNodes[j].textContent.length > 0) {
          childNodes[j].textContent = capitaliseText(childNodes[j].textContent, maxCaps)
          maxCaps -= childNodes[j].textContent.length
        }
        if (maxCaps <= 0) break
      }
      break
    }
  }
}

export function capitaliseText (text, maxCaps) {
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

export function removeSourceTags(document) {
  var sources = document.getElementsByTagName('source')
  for (var i = sources.length - 1; i >= 0; i--) {
    sources[i].remove()
  }
}

export function removeFiguresWithoutImages(document) {
  var figures = document.getElementsByTagName('figure')
  for (var i = figures.length - 1; i >= 0; i--) {
    if (figures[i].getElementsByTagName('img').length === 0) {
      figures[i].remove()
    }
  }
}

export function markPullQuotes(document) {
  var blockquotes = document.getElementsByTagName('blockquote')
  Array.prototype.forEach.call(blockquotes, function (bq) {
    if (bq.textContent.startsWith('“')) {
      bq.classList.add('is-quote')
    }
    if (bq.textContent.length > 200) return
    var sibling = bq.previousElementSibling ||
    bq.parentElement.previousElementSibling
    if (sibling && sibling.textContent) {
      var prevPara = sibling.textContent
      if (prevPara.substring(prevPara.length - 1) !== ':') {
        bq.classList.add('pullquote')
      }
    }
  })
}

export function markQuoteBlockquotes(document) {
  var blockquotes = document.getElementsByTagName('blockquote')
  Array.prototype.forEach.call(blockquotes, function (bq) {
    if (bq.textContent.startsWith('“')) {
      bq.classList.add('is-quote')
    }
  })
}

export function createFigCaptions (document) {
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

export function onlyContentIsImg (node) {
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

export function getChildrenRemoveBlankTextNodes (node) {
  return Array.from(node.childNodes)
  .filter(node => node.nodeType !== 3 || node.nodeValue.trim().length > 0)
}

export function removeAllBrs(document) {
  var brs = document.getElementsByTagName('br')
  let toRemove = []
  for (var i = brs.length - 1; i >= 0; i--) {
    toRemove.push(brs[i])
  }
  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].remove()
  }
}

export function remove1pxImages(document) {
  Array.from(document.querySelectorAll('img'))
  .filter(img => img.getAttribute('height') === '1')
  .forEach(img => {
    img.remove()
  })
}

export function removeWidows (document) {
  const paras = document.querySelectorAll('p')
  Array.prototype.forEach.call(paras, function (el, i) {
    console.log(innerHtml)
  })
}

export function removeNYTImageText (document) {
  removeNodes('figure div span', document)
}

export function removeNodes (query, document) {
  const nodes = document.querySelectorAll(query)
  for (var i = nodes.length - 1; i >= 0; i--) {
    nodes[i].remove()
  }
}

export function removeSrcSets (document) {
  const images = document.querySelectorAll('img')
  for (var i = images.length - 1; i >= 0; i--) {
    images[i].srcset = ''
  }
}

