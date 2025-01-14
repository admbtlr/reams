const getFaviconUrl = (url: string) => {
  if (url.indexOf('substack') !== -1) {
    return `https://icon.horse/icon/${url}`
  } else {
    return`https://icons.duckduckgo.com/ip3/${url}.ico`
  }
}

export default getFaviconUrl