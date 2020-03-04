import { connect } from 'react-redux'
import { SET_FEED_FILTER } from '../store/config/types'
import { CLEAR_READ_ITEMS } from '../store/items/types'
import {
  ITEMS_SCREEN_BLUR,
  ITEMS_SCREEN_FOCUS
} from '../store/ui/types'
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
      type: CLEAR_READ_ITEMS
    }),
    clearFeedFilter: () => dispatch({
      type: SET_FEED_FILTER,
      feedFilter: null
    }),
    screenDidFocus: () => {
      console.log('Focus!')
      return dispatch({
        type: ITEMS_SCREEN_FOCUS
      })
    },
    screenWillBlur: () => dispatch({
      type: ITEMS_SCREEN_BLUR
    })
  }
}

let ItemsScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemsScreen)

export default ItemsScreenContainer
