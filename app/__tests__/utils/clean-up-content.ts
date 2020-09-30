const jsdom = require("jsdom")
const { JSDOM } = jsdom
import {
  replaceSectionsWithDivs,
  moveChildrenUpALevel,
  removeDivsInDivs,
  removeDivsWithImg,
  hasOnlyDivChildren,
  removeArticles,
  removeSoloSurroundingDivs,
  removeDivsWithOrphanFigures,
  convertDivsToFigures,
  removeEmptyDivs,
  markShortParagraphs,
  markSingleCharParagraphs,
  markShortBlockquotes,
  markContentHoldingDivs,
  capitaliseFirstWords,
  capitaliseFirstChildP,
  capitaliseText,
  removeSourceTags,
  removeFiguresWithoutImages,
  markPullQuotes,
  markQuoteBlockquotes,
  createFigCaptions,
  onlyContentIsImg,
  getChildrenRemoveBlankTextNodes,
  removeAllBrs,
  remove1pxImages,
  removeWidows,
  removeNYTImageText,
  removeNodes,
  removeSrcSets
} from '../../utils/clean-up-content.js'

const prefix = '<html><head></head><body><article>'
const postfix = '</article></body></html>'

describe('replaceSectionsWithDivs', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
      .window
    const expected = `${prefix}<div><p>a</p></div><div><div><p>b</p></div></div>${postfix}`
    replaceSectionsWithDivs(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

// describe('moveChildrenUpALevel', () => { 
//     //(div)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     moveChildrenUpALevel(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

describe('removeDivsInDivs', () => {
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<div><p>a</p></div><div><div><p>b</p></div></div>${postfix}`))
      .window
    const expected = `${prefix}<div><p>a</p></div><div><p>b</p></div>${postfix}`
    removeDivsInDivs(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('removeDivsWithImg', () => {
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<div><p>a</p></div><div><div><img></div></div>${postfix}`))
      .window
    const expected = `${prefix}<div><p>a</p></div><img>${postfix}`
    removeDivsWithImg(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('removeArticles', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<article><p>a</p></article><div><article><p>b</p></article></div>${postfix}`))
  .window
    const expected = `${prefix}<p>a</p><div><p>b</p></div>${postfix}`
    removeArticles(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('removeSoloSurroundingDivs', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<p>a</p><div><div><p>b</p></div></div>${postfix}`))
  .window
    const expected = `${prefix}<p>a</p><div><div><p>b</p></div></div>${postfix}`
    removeSoloSurroundingDivs(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('removeDivsWithOrphanFigures', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<div><figure>a</figure></div><div><p>b</p></div>${postfix}`))
  .window
    const expected = `${prefix}<figure>a</figure><div><p>b</p></div>${postfix}`
  removeDivsWithOrphanFigures(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('convertDivsToFigures', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<div><img src=""><p>a</p></div><p>b</p>${postfix}`))
  .window
    const expected = `${prefix}<figure><img src=""><figcaption>a</figcaption></figure><p>b</p>${postfix}`
    convertDivsToFigures(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('removeEmptyDivs', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div> </div>${postfix}`))
  .window
    const expected = `${prefix}<section><p>a</p></section>${postfix}`
    removeEmptyDivs(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('markShortParagraphs', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<p>a</p><p>It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc. It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc.</p>${postfix}`))
  .window
    const expected = `${prefix}<p class="short-para">a</p><p>It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc. It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc.</p>${postfix}`
    markShortParagraphs(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('markSingleCharParagraphs', () => { 
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<p>a</p><p>It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc. It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc.</p>${postfix}`))
  .window
    const expected = `${prefix}<p class="single-char-para">a</p><p>It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc. It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc.</p>${postfix}`
    markSingleCharParagraphs(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

describe('markShortBlockquotes', () => {
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<blockquote>a</blockquote><blockquote>It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc.</blockquote>${postfix}`))
  .window
    const expected = `${prefix}<blockquote class="short-blockquote">a</blockquote><blockquote>It is a far far greater thing that I do now than whereof one cannot speak thereof one must be silent etc.</blockquote>${postfix}`
    markShortBlockquotes(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })
})

// describe('markContentHoldingDivs', () => {
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     markContentHoldingDivs(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('capitaliseFirstWords', () => {
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     capitaliseFirstWords(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('capitaliseFirstChildP', () => {
//     //(el)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     capitaliseFirstChildP(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('capitaliseText', () => { 
//     //(text,
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     capitaliseText(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

describe('removeSourceTags', () => {
    //(document)
  it('should do what it says', () => {
    const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  .window
    const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
    removeSourceTags(document)
    expect(document.documentElement.outerHTML).toEqual(expected)  
  })

// describe('removeFiguresWithoutImages', () => {
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     removeFiguresWithoutImages(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('markPullQuotes', () => {
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     markPullQuotes(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('markQuoteBlockquotes', () => {
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     markQuoteBlockquotes(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('createFigCaptions', () => { 
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     createFigCaptions(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('onlyContentIsImg', () => { 
//     //(node)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     onlyContentIsImg(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('getChildrenRemoveBlankTextNodes', () => { 
//     //(node)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     getChildrenRemoveBlankTextNodes(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('removeAllBrs', () => {
//     //(document)
//   const { document } = (new JSDOM(`()
//   const expected = `<html>
// <body>
// </body></html>` => `it('should )).window
//   do what it says', ()
//   const expected = `<html>
// <body>
// </body></html>` => {
//     ',(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('remove1pxImages', () => {
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     remove1pxImages(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('removeWidows', () => { 
//     //(document)
//   const { document } = (new JSDOM(`()
//   const expected = `<html>
// <body>
// </body></html>` => `it('should )).window
//   do what it says', ()
//   const expected = `<html>
// <body>
// </body></html>` => {
//     ',(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('removeNYTImageText', () => { 
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     removeNYTImageText(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('removeNodes', () => { 
//     //(query,
//   const { document } = (new JSDOM(`()
//   const expected = `<html>
// <body>
// </body></html>` => `it('should )).window
//   do what it says', ()
//   const expected = `<html>
// <body>
// </body></html>` => {
//     ',(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })

// describe('removeSrcSets', () => { 
//     //(document)
//   it('should do what it says', () => {
//     const { document } = (new JSDOM(`${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`))
  // .window
//     const expected = `${prefix}<section><p>a</p></section><div><section><p>b</p></section></div>${postfix}`
//     removeSrcSets(document)
//     expect(document.documentElement.outerHTML).toEqual(expected)  
//   })