import { connect } from 'react-redux'
import AppStateListener from '../components/AppStateListener'

const mapStateToProps = (state) => {
  const appState = state.appState || 'inactive'
  const lastUpdated = state.config.lastUpdated || 0
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
    saveURL: (url) => dispatch({
      type: 'SAVE_EXTERNAL_URL',
      url
    }),
    addFeed: (feed) => dispatch({
      type: 'FEEDS_ADD_FEED',
      feed
    }),
    setUpdated: () => dispatch({
      type: 'CONFIG_LAST_UPDATED',
      lastUpdate: Date.now()
    }),
    showModal: (modalProps) => dispatch({
      type: 'UI_SHOW_MODAL',
      modalProps
    }),
    finishedCheckingBuckets: () => dispatch({
      type: 'UI_FINSHED_CHECKING_BUCKETS'
    })
  }
}

let AppStateListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppStateListener)

export default AppStateListenerContainer
