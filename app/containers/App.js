import { connect } from 'react-redux'
import { ADD_FEEDS } from '../store/feeds/types'
import App from '../components/App.js'

const mapStateToProps = (state, ownProps) => {
  return {
    isFirstTime: state.config.isFirstTime,
    userId: state.user.uid
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleFirstTime: (isFirstTime) => dispatch({
      type: 'TOGGLE_FIRST_TIME',
      isFirstTime: false
    }),
    addFeeds: (feeds) => dispatch({
      type: ADD_FEEDS,
      feeds
    }),
    screenChanged: (screen) => dispatch({
      type: 'NAVIGATION_SCREEN_CHANGED',
      screen
    })
  }
}

let AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default AppContainer
