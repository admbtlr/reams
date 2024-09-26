import { connect } from 'react-redux'
import { 
  SET_TITLE_FONT_SIZE
} from '../store/items/types'
import { isPortrait } from '../utils/dimensions'
import ItemTitleWithHook from '../components/ItemTitle.js'

const mapStateToProps = (state, ownProps) => {
  // const index = getIndex(state)
  // const items = getItems(state)
  const styles = ownProps.item &&
      ownProps.item.styles &&
      ownProps.item.styles.title
  const title = ownProps.title || ownProps.item?.title
  return {
    // isVisible: ownProps.index === index,
    // need to respond to styles changes, because component updates its own font size
    styles: styles,
    coverImageStyles: ownProps.coverImageStyles || styles?.coverImage,
    // this is just a foul hack to see what's going on
    fontSize: styles && styles.fontSize,
    isDarkMode: state.ui.isDarkMode,
    displayMode: state.itemsMeta.display,
    isPortrait: isPortrait(),
    title
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateFontSize: (item, fontSize) => dispatch({
      type: SET_TITLE_FONT_SIZE,
      fontSize,
      item
    })
  }
}

let ItemTitleContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemTitleWithHook)

export default ItemTitleContainer
