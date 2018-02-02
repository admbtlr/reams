import { connect } from 'react-redux'
import FeedList from '../components/FeedList.js'
import { itemsFetchData  } from '../redux/actions/items.js'

const mapStateToProps = (state) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.items.display === 'unread' ? state.items.index : state.items.savedIndex
  const numItems = items.length
  return {
    numItems,
    index,
    displayMode: state.items.display
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentIndex: (index, lastIndex) => dispatch({
      type: 'ITEMS_UPDATE_CURRENT_INDEX',
      index,
      lastIndex
    }),
    // markRead: (item) => dispatch(itemMarkRead(item)),
    // fetchMercuryStuff: (item) => dispatch(itemsLoadMercuryStuff(item))
  }
}

let FeedListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedList)

export default FeedListContainer
