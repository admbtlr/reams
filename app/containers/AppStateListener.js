import { ItemType } from '../store/items/types'
import { connect } from 'react-redux'
import { ADD_FEED } from '../store/feeds/types'
import { 
  SHOW_MODAL
} from '../store/ui/types'
import { 
  SET_DISPLAY_MODE
} from '../store/items/types'
import AppStateListener from '../components/AppStateListener'

const mapStateToProps = (state) => {
  const appState = state.appState || 'inactive'
  const lastUpdated = state.itemsUnread.lastUpdated || 0
  return {
    appState,
    lastUpdated
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: () => dispatch({
      type: 'ITEMS_FETCH_ITEMS'
    }),
    updateCurrentAppState: (state) => dispatch(updateCurrentAppState(state)),
    saveURL: (url) => {
      dispatch({
        type: 'SAVE_EXTERNAL_URL',
        url
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
    showModal: (modalProps) => {
      console.log("SHOW MODAL!")
      dispatch({
        type: SHOW_MODAL,
        modalProps
      })
    },
    finishedCheckingBuckets: () => dispatch({
      type: 'UI_FINSHED_CHECKING_BUCKETS'
    }),
    appWentInactive: () => dispatch({
      type: 'STATE_INACTIVE'
    }),
    appWentActive: () => dispatch({
      type: 'STATE_ACTIVE'
    }),
    setDarkMode: (isDarkMode) => dispatch({
      type: 'WEBVIEW_SET_DARK_MODE',
      isDarkMode
    })
  }
}

let AppStateListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppStateListener)

export default AppStateListenerContainer
