import { 
  STATE_ACTIVE,
  STATE_INACTIVE
} from '../store/config/types'
import { connect } from 'react-redux'
import { 
  CHECK_BUCKETS,
  ADD_MESSAGE,
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
  }
}

let AppStateListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppStateListener)

export default AppStateListenerContainer
