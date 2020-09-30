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

window.onload = function() {
  markImages()
  addTapMessageToImages()
  // addTapMessageToLinks()
  removeAllBrs()
}
