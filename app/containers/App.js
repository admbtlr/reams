import { connect } from 'react-redux'
import { TOGGLE_FIRST_TIME } from '../store/config/types'
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
      type: TOGGLE_FIRST_TIME,
      isFirstTime: false
    }),
    addFeeds: (feeds) => dispatch({
      type: ADD_FEEDS,
      feeds
    })
  }
}

let AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default AppContainer
