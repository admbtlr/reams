import { connect } from 'react-redux'
import TopBar from '../components/TopBar.js'
import { itemsUpdateCurrentIndex } from '../redux/actions/items.js'

const mapStateToProps = (state, ownProps) => {
  const feedFilter = state.config.feedFilter
  const items = state.items.display === 'unread' ?
    (feedFilter ?
      state.items.items.filter(item => item.feed_id === feedFilter) :
      state.items.items) :
    state.items.saved
  const index = state.items.display === 'unread' ?
    state.items.index :
    state.items.savedIndex
  const currentItem = items.length > 1 ? items[index] : null
  const prevItem = index > 0 ? items[index - 1] : null
  const nextItem = index < items.length - 1 ? items[index + 1] : null
  return {
    prevItem,
    currentItem,
    nextItem,
    toolbar: state.toolbar,
    displayMode: state.items.display,
    isFiltered: !!feedFilter,
    ...ownProps
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleViewButtons: () => dispatch({
      type: 'UI_TOGGLE_VIEW_BUTTONS'
    }),
    showItemButtons: () => dispatch({
      type: 'UI_SHOW_ITEM_BUTTONS'
    }),
    hideAllButtons: () => dispatch({
      type: 'UI_HIDE_ALL_BUTTONS'
    }),
    markAllRead: (id) => dispatch({
      type: 'FEED_MARK_READ',
      id
    }),
    unsubscribe: (id) => dispatch({
      type: 'FEEDS_REMOVE_FEED',
      id
    })
  }
}

let TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar)

export default TopBarContainer
