import { connect } from 'react-redux'
import ItemTitle from '../components/ItemTitle.js'

const mapStateToProps = (state, ownProps) => {
  const items = state.itemsMeta.display === 'unread' ?
    (feedFilter ?
      state.itemsUnread.filter(item => item.feed_id === feedFilter) :
      state.itemsUnread) :
    state.itemsSaved
  const index = state.itemsMeta.display === 'unread' ?
    state.itemsMeta.index :
    state.itemsMeta.savedIndex
  return {
    isVisible: ownProps.index === index,
    // need to respond to styles changes, because component updates its own font size
    styles: items[ownProps.index].styles.title,
    // this is just a foul hack to see what's going on
    fontSize: items[ownProps.index].styles.title.fontSize
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateFontSize: (item, fontSize) => dispatch({
      type: 'UPDATE_CURRENT_ITEM_TITLE_FONT_SIZE',
      fontSize,
      item
    }),
    setFontResized: (item) => dispatch({
      type: 'UPDATE_CURRENT_ITEM_TITLE_FONT_RESIZED',
      item
    })
  }
}

let ItemTitleContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemTitle)

export default ItemTitleContainer
