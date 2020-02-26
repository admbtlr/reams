import { connect } from 'react-redux'
import { SET_FEED_FILTER } from '../store/config/types'
import ItemsScreen from '../components/ItemsScreen.js'

const mapStateToProps = (state) => {
  return {
    displayMode: state.itemsMeta.display,
    isOnboarding: state.config.isOnboarding,
    isAuthenticated: !!state.user.uid || !!state.user.username
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearReadItems: () => dispatch({
      type: 'ITEMS_CLEAR_READ'
    }),
    clearFeedFilter: () => dispatch({
      type: SET_FEED_FILTER,
      feedFilter: null
    }),
    screenDidFocus: () => {
      console.log('Focus!')
      return dispatch({
        type: 'NAVIGATION_ITEMS_SCREEN_FOCUS'
      })
    },
    screenWillBlur: () => dispatch({
      type: 'NAVIGATION_ITEMS_SCREEN_BLUR'
    })
  }
}

let ItemsScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemsScreen)

export default ItemsScreenContainer
