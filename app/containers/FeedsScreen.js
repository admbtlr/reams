import { connect } from 'react-redux'
import { SET_FILTER } from '../store/config/types'
import { 
  MARK_FEED_READ,
  REMOVE_FEED
} from '../store/feeds/types'
import { 
  CLEAR_READ_ITEMS,
  UPDATE_CURRENT_INDEX,
  ItemType 
} from '../store/items/types'
import { 
  SHOW_MODAL
} from '../store/ui/types'
import FeedsScreen from '../components/FeedsScreen.js'
import { CREATE_CATEGORY } from '../store/categories/types'

const testFeeds = [
  {
    isLiked: true,
    title: 'a',
    number_unread: 10
  },
  {
    isLiked: false,
    title: 'h',
    number_unread: 0
  },
  {
    isLiked: false,
    title: 'g',
    number_unread: 0
  },
  {
    isLiked: false,
    title: 'f',
    number_unread: 1
  },
  {
    isLiked: false,
    title: 'e',
    number_unread: 2
  },
  {
    isLiked: false,
    title: 'd',
    number_unread: 3
  },
  {
    isLiked: false,
    title: 'c',
    number_unread: 3
  },
  {
    isLiked: true,
    title: 'b',
    number_unread: 9
  }
]

const sortFeeds = (a, b) => (a.isLiked && b.isLiked) || (a.number_unread === 0 && b.number_unread === 0) ?
  (normaliseTitle(a.title) < normaliseTitle(b.title) ? -1 : 1) :
  a.isLiked ? -1 :
    b.isLiked ? 1 :
      a.number_unread === 0 ? 1 :
        b.number_unread === 0 ? -1 :
          (normaliseTitle(a.title) < normaliseTitle(b.title) ? -1 : 1)

const addUnreadCount = (feed, items) => {
  const unreadItems = items.filter(i => i.feed_id === feed._id)
  feed.number_unread = unreadItems.length
  return feed
}

const normaliseTitle = (title) => title.slice(0, 4).toUpperCase() === 'THE ' ?
  title.slice(4).toUpperCase() :
  title.toUpperCase()

// const sortFeeds = (a, b) => b.number_unread - a.number_unread

const mapStateToProps = (state) => {
  const items = state.itemsUnread.items
  const feeds = state.feeds.feeds.slice()
    .map(f => addUnreadCount(f, items))
    .sort(sortFeeds)
  const itemSort = state.config.itemSort
  const categories = state.categories.categories.filter(c => !c.isSystem)
  const backendLabels = {
    feedbin: 'Feedbin',
    feedwrangler: 'Feedwrangler',
    rizzle: 'Rizzle',
    basic: 'Rizzle Basic'
  }

  return {
    backend: backendLabels[state.config.backend],
    feeds,
    categories,
    isDarkMode: state.ui.isDarkMode,
    isPortrait: state.config.orientation === 'portrait',
    numItems: items.length,
    itemSort,
    uid: state.user.uid
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    markAllRead: (olderThan) => dispatch({
      type: MARK_FEED_READ,
      id: null,
      originalId: null,
      olderThan: olderThan || Math.floor(Date.now() / 1000)
    }),
    setIndex: (index) => dispatch({
      type: UPDATE_CURRENT_INDEX,
      index,
      displayMode: ItemType.unread
    }),
    showModal: (modalProps) => dispatch({
      type: SHOW_MODAL,
      modalProps
    }),
    unsubscribe: (id) => dispatch({
      type: REMOVE_FEED,
      id
    }),
    clearReadItems: () => dispatch({
      type: CLEAR_READ_ITEMS
    }),
    clearFilter: () => dispatch({
      type: SET_FILTER,
      filter: null
    }),
    createCategory: (name) => dispatch({
      type: CREATE_CATEGORY,
      name
    })
  }
}

let FeedsScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedsScreen)

export default FeedsScreenContainer
