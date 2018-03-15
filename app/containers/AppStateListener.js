import { connect } from 'react-redux'
import AppStateListener from '../components/AppStateListener'

const mapStateToProps = (state) => {
  const appState = state.appState || 'inactive'
  return {
    appState
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
    addFeed: (url) => dispatch({
      type: 'FEEDS_ADD_FEED',
      url
    })
  }
}

let AppStateListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AppStateListener)

export default AppStateListenerContainer
