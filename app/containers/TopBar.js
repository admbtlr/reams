import { connect } from 'react-redux'
import TopBar from '../components/TopBar.js'
import { itemsUpdateCurrentIndex } from '../redux/actions/items.js'

const mapStateToProps = (state) => {
  const items = state.items.display === 'unread' ? state.items.items : state.items.saved
  const index = state.items.display === 'unread' ? state.items.index : state.items.savedIndex
  const currentItem = items.length > 1 ? items[index] : null
  return {
    currentItem,
    toolbar: state.toolbar,
    displayMode: state.items.display
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleViewButtons: () => dispatch({
      type: 'UI_TOGGLE_VIEW_BUTTONS'
    })
  }
}

let TopBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopBar)

export default TopBarContainer
