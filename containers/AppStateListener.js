import { 
  SAVE_EXTERNAL_URL,
  ItemType
} from '../store/items/types'
import { 
  STATE_ACTIVE,
  STATE_INACTIVE
} from '../store/config/types'
import { connect } from 'react-redux'
import { ADD_FEED } from '../store/feeds/types'
import { 
  ADD_MESSAGE,
  FETCH_ITEMS
} from '../store/ui/types'
import { 
  SET_DISPLAY_MODE
} from '../store/items/types'
import AppStateListener from '../components/AppStateListener'

const mapStateToProps = (state) => {
  const appState = state.appState || 'inactive'
  const lastUpdated = state.itemsUnread.lastUpdated || 0
  const isOnboarding = state.config.isOnboarding
  const savedItems = state.itemsSaved.items
  return {
    appState,
    isOnboarding,
    lastUpdated,
    savedItems
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: () => dispatch({
      type: FETCH_ITEMS
    }),
    updateCurrentAppState: (state) => dispatch(updateCurrentAppState(state)),
    saveURL: (url, title) => {
      dispatch({
        type: SAVE_EXTERNAL_URL,
        url,
        title
      })
      dispatch({
        type: SET_DISPLAY_MODE,
        displayMode: ItemType.saved
      })
    },
    addFeed: (feed) => dispatch({
      type: ADD_FEED,
      feed
    }),
    appWentInactive: () => dispatch({
      type: STATE_INACTIVE,
      time: Date.now()
    }),
    appWentActive: () => dispatch({
      type: STATE_ACTIVE,
      time: Date.now()
    }),
    addMessage: (messageString) => dispatch({
      type: ADD_MESSAGE,
      message: {
        messageString,
        isSelfDestruct: true
      }
    })
  }
}

let AppStateListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppStateListener)

export default AppStateListenerContainer
