import { store } from '../store'

export default function rizzleSort (items, feeds) {
  feeds = feeds || (store && store.getState().feeds.feeds)
  items.forEach(item => {
    if (!feeds.find(feed => feed._id === item.feed_id)) {
      console.log('NO FEED FOR ITEM!?')
      console.log(item)
    }
  })
  const liked = items.filter(item => feeds.find(feed => feed._id === item.feed_id)
    .isLiked)
  const notLiked = items.filter(item => liked.indexOf(item) === -1)
  liked.sort((a, b) => b.created_at - a.created_at)
  notLiked.sort((a, b) => b.created_at - a.created_at)
  return liked.concat(notLiked)
  // return items.map(item => {
  //   const readingRate = feeds.find(f => f._id === item.feed_id).reading_rate
  //   const sorter = 1 / ((now - item.created_at) / 10000)
  //   return {
  //     ...item,
  //     sorter
  //   }
  // }).sort((a, b) => b.sorter - a.sorter)

// another possible algorithm here would be
// sort the items by date
// then sort each by day by feed reading_rate
  // const sorted = items.sort((a, b) => {
  //   const aDate = new Date(a.created_at)
  //   const bDate = new Date(b.created_at)
  //   if (aDate.getFullYear() === bDate.getFullYear() &&
  //     aDate.getMonth() === bDate.getMonth() &&
  //     aDate.getDate() === bDate.getDate()) {
  //     return (feeds.find(f => f._id === b.feed_id).reading_rate || 10) -
  //       (feeds.find(f => f._id === a.feed_id).reading_rate || 10)
  //   } else {
  //     return b.created_at - a.created_at
  //   }
  // })
  // return rizzleShuffle(sorted, shuffleStrength)

  // let itemsByFeed = {}
  // let keys = []
  // let sorted = []
  // items.forEach(i => {
  //   (itemsByFeed[i.feed_id] = itemsByFeed[i.feed_id] || []).push(i)
  // })
  // keys = Object.keys(itemsByFeed)
  // keys.forEach(k => {
  //   itemsByFeed[k].sort((a, b) => b.created_at - a.created_at)
  // })
  // keys.sort((a, b) => {
  //   aFeed = feeds.find(f => f._id === a)
  //   bFeed = feeds.find(f => f._id === b)
  //   return bFeed.reading_rate - aFeed.reading_rate
  // })
  // keys.forEach(k => {
  //   sorted = sorted.concat(itemsByFeed[k])
  // })
  // return rizzleShuffle(sorted)
}

// caution side effects!
// adds a `shuffle_factor` to each item, so that the shuffle is deterministic
function rizzleShuffle(items, shuffleStrength) {
  // this used to be (items.length / 10)
  console.log('Preshuffle: ' + items.map(i => i.title))
  items = items.map(i => i.shuffle_factor
    ? i
    : {
      ...i,
      shuffle_factor: Math.random() * shuffleStrength - shuffleStrength / 2
    })

  return items.sort((a, b) => (items.indexOf(a) - a.shuffle_factor) -
    (items.indexOf(b) - b.shuffle_factor))
}
