import { connect } from 'react-redux'
import App from '../components/App.js'

const mapStateToProps = (state, ownProps) => {
  return {
    isFirstTime: state.config.isFirstTime
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleFirstTime: (isFirstTime) => dispatch({
      type: 'TOGGLE_FIRST_TIME',
      isFirstTime: false
    }),
    addFeeds: (feeds) => dispatch({
      type: 'FEEDS_ADD_FEEDS',
      feeds
    })
  }
}

let AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default AppContainer
