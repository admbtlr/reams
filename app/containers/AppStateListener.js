import { 
  STATE_ACTIVE,
  STATE_INACTIVE
} from '../store/config/types'
import { connect } from 'react-redux'
import { 
  CHECK_BUCKETS,
  FETCH_ITEMS,
} from '../store/ui/types'
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
      type: FETCH_ITEMS
    }),
    checkBuckets: () => dispatch({
      type: CHECK_BUCKETS
    }),
    updateCurrentAppState: (state) => dispatch(updateCurrentAppState(state)),
    appWentInactive: () => dispatch({
      type: STATE_INACTIVE
    }),
    appWentActive: () => dispatch({
      type: STATE_ACTIVE
    }),
    setDarkMode: (isDarkMode) => dispatch({
      type: SET_DARK_MODE,
      isDarkMode
    })
  }
}

let AppStateListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppStateListener)

export default AppStateListenerContainer
