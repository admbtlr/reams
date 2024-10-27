import { Direction } from '../store/config/types'
import { store } from '../store'
import { consoleLog } from './log'

export default function rizzleSort (items, feeds, sortDirection) {
  // put a buffer of decorated items in front of the undecorated ones
  // to give the undecorated items a chance to decorate
  // assumptions:
  // - the current item will end up at the front
  // - the index will end up at the front too
  // - read items have already been removed
  // - items have already been sorted as required
  const bufferWithSortIndex = (items) => {
    let buffer = 5
    const itemsWithIndex = items.filter(i => i.sortIndex !== undefined)
    const itemsWithoutIndex = items.filter(i => i.sortIndex === undefined)
    if (itemsWithIndex.length < buffer) {
      buffer = itemsWithIndex.length
    }
    // let i = buffer - 1
    // while (i >= 0) {
    //   if (items[i].sortIndex === undefined) {
    //     items = items.slice(0, i)
    //       .concat(items.slice(i+1, buffer+1)
    //       .concat(items[i])
    //       .concat(items.slice(buffer+1)))
    //   }
    //   i--
    // }
    return itemsWithIndex.slice(0, buffer)
      .concat(itemsWithoutIndex)
      .concat(itemsWithIndex.slice(buffer))
  }

  const splitIntoLikedNotLiked = (items, feeds) => {
    const liked = items.filter(item => {
      const feed = feeds.find(feed => feed._id === item.feed_id)
      // occasionally feed here is undefined. wtf?
      if (feed == null) {
        consoleLog('Cannot find feed ' + item.feed_id)
      }
      return feed && feed.isLiked
    })
    const notLiked = items.filter(item => liked.indexOf(item) === -1)
    return { liked, notLiked }
  }

  feeds = feeds || (store && store.getState().feeds.feeds)
  sortDirection = sortDirection === undefined ? (store && store.getState().config.itemSort) : sortDirection
  items.forEach(item => {
    if (!feeds.find(feed => feed._id === item.feed_id)) {
      console.log('NO FEED FOR ITEM!?')
      // console.log(item)
    }
  })
  const { liked, notLiked } = splitIntoLikedNotLiked(items, feeds)

  const sortFunction = sortDirection === Direction.desc ?
    (a, b) => b.created_at - a.created_at :
    (sortDirection === Direction.asc ?
      (a, b) => a.created_at - b.created_at :
      (a, b) => Math.random() - 0.5
    )

  liked.sort(sortFunction)
  notLiked.sort(sortFunction)
  const sorted = sortDirection === Direction.desc ?
    bufferWithSortIndex(liked.concat(notLiked)) :
    liked.concat(notLiked)

  return sorted.map((i, index) => ({
    ...i,
    sortIndex: index
  }))
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
