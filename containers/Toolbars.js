import { connect } from 'react-redux'
import Toolbars from '../components/Toolbars.js'
import {
  updateClampedScrollAnim,
  updateClampedScrollAnimNormalised
} from '../redux/actions/items.js'

const mapStateToProps = (state) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.items.display === 'unread' ? state.items.index : state.items.savedIndex
  return {
    currentItem: items[index],
    scrollOwner: state.toolbar.scrollOwner
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateClampedScrollAnim: anim => dispatch(updateClampedScrollAnim(anim)),
    updateClampedScrollAnimNormalised: anim => dispatch(updateClampedScrollAnimNormalised(anim))
  }
}

let ToolbarsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toolbars)

export default ToolbarsContainer
