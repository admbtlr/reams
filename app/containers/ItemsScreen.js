import { connect } from 'react-redux'
import ItemsScreen from '../components/ItemsScreen.js'

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearReadItems: () => dispatch({
      type: 'ITEMS_CLEAR_READ'
    }),
    clearFeedFilter: () => dispatch({
      type: 'CONFIG_SET_FEED_FILTER',
      feedId: null
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
