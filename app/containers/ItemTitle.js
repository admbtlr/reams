import { connect } from 'react-redux'
import { getIndex, getItems } from '../utils/get-item'
import ItemTitle from '../components/ItemTitle.js'

const mapStateToProps = (state, ownProps) => {
  const index = getIndex(state)
  const items = getItems(state)
  const styles = items[ownProps.index] &&
      items[ownProps.index].styles &&
      items[ownProps.index].styles.title
  return {
    // isVisible: ownProps.index === index,
    // need to respond to styles changes, because component updates its own font size
    styles: styles,
    // this is just a foul hack to see what's going on
    fontSize: styles && styles.fontSize,
    isDarkBackground: state.webView.isDarkBackground,
    displayMode: state.itemsMeta.display
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
