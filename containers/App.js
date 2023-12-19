import { connect } from 'react-redux'
import { ADD_FEEDS } from '../store/feeds/types'
import App from '../components/App'

const mapStateToProps = (state, ownProps) => ({})

const mapDispatchToProps = (dispatch) => {
  return {
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
