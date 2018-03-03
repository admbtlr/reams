export const fetchUnreadItems = (feeds) => {
  const promises = feeds.map(feed => {
    const url = `https://api.rizzle.net?url=${feed.url}`
    return fetch(url)
  })
  return Promise.all(promises)
}

export const markItemRead = (item) => {}
