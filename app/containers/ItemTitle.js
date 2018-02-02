import { connect } from 'react-redux'
import ItemTitle from '../components/ItemTitle.js'

const mapStateToProps = (state, ownProps) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.items.display === 'unread' ? state.items.index : state.items.savedIndex
  return {
    isVisible: ownProps.index === index,
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
