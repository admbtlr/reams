import { state } from "../__mocks__/state-input"
import { addFeed } from "../backends/reams"
import { id } from "../utils"
import { Category } from "./categories/types"
import { Feed, FeedLocal } from "./feeds/types"
import hostColors from "./hostColors/hostColors"
import { Item } from "./items/types"
import { RootState } from "./reducers"
import { DarkModeSetting } from "./ui/types"
import { Backend } from "./user/user"

export const migrations = {
  0: (state: RootState) => {
    // null migration
    return state
  },
  1: (state: RootState) => {
    // migration to
    // 1. add categories
    // 2. add inbox, archive and annotated categories
    // 3. add saved items to inbox
    const inboxCategory: Category = {
      _id: 'inbox',
      name: 'inbox',
      isSystem: true,
      itemIds: [],
      // @ts-ignore - historical migration with old property
      feedIds: [],
      newsletterIds: []
    }
    const archiveCategory: Category = {
      _id: 'archive',
      name: 'archive',
      isSystem: true,
      itemIds: [],
      // @ts-ignore - historical migration with old property
      feedIds: [],
      newsletterIds: []
    }
    const annotatedCategory: Category = {
      _id: 'annotated',
      name: 'annotated',
      isSystem: true,
      itemIds: [],
      // @ts-ignore - historical migration with old property
      feedIds: [],
      newsletterIds: []
    }
    state.itemsSaved.items.forEach((item: Item) => {
      if (!inboxCategory.itemIds.includes(item._id)) {
        inboxCategory.itemIds.push(item._id)
      }
    })  
    if (!state.categories) {
      state.categories = {
        categories: []
      }
    }
    
    return {
      ...state,
      categories: {
        categories: [
          ...state.categories.categories,
          inboxCategory,
          archiveCategory,
          annotatedCategory
        ]
      }
    }
  },
  2: (state: RootState) => {
    // migration to change is_external to isExternal
    state.itemsSaved.items.forEach((item: Item) => {
      // @ts-ignore
      if (item.is_external) {
        // @ts-ignore
        item.isExternal = item.is_external
        // @ts-ignore
        delete item.is_external
      }
    })
    return state
  },
  3: (state: RootState) => {
    // migration to add unique user id
    // @ts-ignore
    state.config.userId = id()
    return state
  },
  4: (state: RootState) => {
    // migration to add readwise token
    // @ts-ignore
    state.config.readwiseToken = null
    return state
  },
  5: (state: RootState) => {
    // oops
    // @ts-ignore
    state.config.userId = id()
    return {
      ...state,
      config: {
        ...state.config,
        userId: id(),
        readwiseToken: null
      }
    }
  },
  6: (state: RootState) => {
    // add darkModeSetting
    return {
      ...state,
      ui: {
        ...state.ui,
        darkModeSetting: DarkModeSetting.AUTO
      }
    }
  },
  7: (state: RootState) => {
    // move userId to user.analyticsId
    return {
      ...state,
      user: {
        ...state.user,
        // @ts-ignore
        analyticsId: state.config.userId
      },
      config: {
        ...state.config,
        userId: null
      }
    }
  },
  8: (state: RootState) => {
    // remove user accounts from config
    return {
      ...state,
      config: {
        isOnboarding: state.config.isOnboarding,
        lastUpdated: state.config.lastUpdated,
        onboardingIndex: state.config.onboardingIndex,
        onboardingLength: state.config.onboardingLength,
        filter: state.config.filter,
        isOnline: state.config.isOnline,
        orientation: state.config.orientation,
        itemSort: state.config.itemSort,
        showNumUnread: state.config.showNumUnread,
        lastActivated: state.config.lastActivated,
        isItemsOnboardingDone: state.config.isItemsOnboardingDone,
        isFeedOnboardingDone: state.config.isFeedOnboardingDone,
      }
    }
  },
  9: (state: RootState) => {
    // move backends to user
    let backends: Backend[] = state.user.backends || []
    // @ts-ignore
    if (state.config.backend === 'feedbin' && !!state.user.backends.find((b: Backend) => b.name === 'feedbin')) {
      backends.push({
        name: 'feedbin',
        // @ts-ignore
        username: state.user.username
      })
    }
    // @ts-ignore
    if (state.config.readwiseToken) {
      backends.push({
        name: 'readwise',
        // @ts-ignore
        accessToken: state.config.readwiseToken
      })
    }
    // @ts-ignore
    delete state.config.backend
    // @ts-ignore
    delete state.config.readwiseToken

    return {
      ...state,
      user: {
        ...state.user,
        backends
      }
    }
  },
  10: (state: RootState) => {
    // add itemsIds[] to all categories
    return {
      ...state,
      categories: {
        ...state.categories,
        categories: state.categories.categories.map((c: Category) => {
          return {
            ...c,
            itemIds: []
          }
        })
      }
    }
  },  
  11: (state: RootState) => {
    // rename hasLoadedMercuryStuff to isDecorated
    return {
      ...state,
      itemsUnread: {
        ...state.itemsUnread,
        items: state.itemsUnread.items.map((i: Item) => {
          return {
            ...i,
            // @ts-ignore
            isDecorated: i.hasLoadedMercuryStuff
          }
        })
      },
      itemsSaved: {
        ...state.itemsSaved,
        items: state.itemsSaved.items.map((i: Item) => {
          return {
            ...i,
            // @ts-ignore
            isDecorated: i.hasLoadedMercuryStuff
          }
        })
      }
    }
  },
  12: (state: RootState) => {
    // update feed ids to be based on url
    const oldFeeds = state.feeds.feeds
    const oldFeedIds = oldFeeds.map((f: Feed) => ({
      _id: f._id,
      url: f.url
    }))
    const feeds = state.feeds.feeds.map((f: Feed) => {
      return {
        ...f,
        _id: id(f.url)
      }
    })
    console.log('remapping items')
    const items = state.itemsUnread.items.map((i: Item) => {
      const oldFeedId = oldFeedIds.find((ofi) => ofi._id === i.feed_id)
      if (!oldFeedId) {
        throw new Error('No old feed id')
      }
      const newFeedId = feeds.find((f: Feed) => f.url === oldFeedId.url)
      if (!newFeedId) {
        throw new Error('No new feed id')
      }
      return {
        ...i,
        feed_id: newFeedId._id
      }
    })
    console.log('remapping feedslocal')
    const feedsLocal = state.feedsLocal.feeds.map((f: FeedLocal) => {
      const oldFeedId = oldFeedIds.find((ofi) => ofi._id === f._id)
      if (!oldFeedId) {
        throw new Error('No old feed id')
      }
      const newFeedId = feeds.find((f: Feed) => f.url === oldFeedId.url)
      if (!newFeedId) {
        throw new Error('No new feed id')
      }
      return {
        ...f,
        _id: newFeedId._id
      }
    })
    console.log('remapping categories')
    const categories = state.categories.categories.map((c: Category) => {
      // @ts-ignore - historical migration with old property
      const categoryOldFeedIds = c.feedIds.map(f_id => oldFeedIds.find((ofi) => ofi._id === f_id))
      const newFeedIds = categoryOldFeedIds.map((cofid) => feeds.find((f: Feed) => f.url === cofid?.url))
      return {
        ...c,
        feeds: newFeedIds
      }
    })
    return {
      ...state,
      feeds: {
        ...state.feeds,
        feeds
      },
      feedsLocal: {
        ...state.feedsLocal,
        feeds: feedsLocal
      },
      itemsUnread: {
        ...state.itemsUnread,
        items
      },
      categories: {
        ...state.categories,
        categories
      }
    }
  },
  13: (state: RootState) => { 
    console.log(state)
    // update feed.id to feed.feedbinId
    const feeds = state.feeds.feeds.map((f: Feed) => {
      return {
        ...f,
        id: undefined,
        // @ts-ignore
        feedbinId: f.id
      }
    })
    return {
      ...state,
      feeds: {
        ...state.feeds,
        feeds
      }
    }
  },
  14: (state: RootState) => {
    // feeds to feedIds on category
    const categories = state.categories.categories.map((c: Category) => {
      return {
        ...c,
        // @ts-ignore - historical migration with old property
        feedIds: c.feedIds,
        feeds: undefined
      }
    })
    return {
      ...state,
      categories: {
        ...state.categories,
        categories
      }
    }
  },
  15: (state: RootState) => {
    // add hostColors
    return {
      ...state,
      hostColors: {
        hostColors: []
      }
    }
  },
  16: (state: RootState) => {
    // convert feedIds to sourceIds in categories
    const categories = state.categories.categories.map((c: Category) => {
      return {
        ...c,
        // @ts-ignore - historical migration converting old property
        sourceIds: c.feedIds || [],
        feedIds: undefined
      }
    })
    return {
      ...state,
      categories: {
        ...state.categories,
        categories
      }
    }
  },
  17: (state: RootState) => {
    // convert sourceIds back to separate feedIds and newsletterIds in categories
    const categories = state.categories.categories.map((c: Category) => {
      return {
        ...c,
        // @ts-ignore - historical migration converting old property
        feedIds: c.sourceIds || [],
        newsletterIds: [],
        sourceIds: undefined
      }
    })
    return {
      ...state,
      categories: {
        ...state.categories,
        categories
      }
    }
  }
}
