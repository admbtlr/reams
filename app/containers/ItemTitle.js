import { connect } from 'react-redux'
import { 
  SET_TITLE_FONT_RESIZED,
  SET_TITLE_FONT_SIZE
} from '../store/items/types'
import ItemTitle from '../components/ItemTitle.js'

const mapStateToProps = (state, ownProps) => {
  // const index = getIndex(state)
  // const items = getItems(state)
  const styles = ownProps.item &&
      ownProps.item.styles &&
      ownProps.item.styles.title
  return {
    // isVisible: ownProps.index === index,
    // need to respond to styles changes, because component updates its own font size
    styles: styles,
    // this is just a foul hack to see what's going on
    fontSize: styles && styles.fontSize,
    isDarkMode: state.ui.isDarkMode,
    displayMode: state.itemsMeta.display
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateFontSize: (item, fontSize) => dispatch({
      type: SET_TITLE_FONT_SIZE,
      fontSize,
      item
    }),
    setFontResized: (item) => dispatch({
      type: SET_TITLE_FONT_RESIZED,
      item
    })
  }
}

let ItemTitleContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemTitle)

export default ItemTitleContainer
