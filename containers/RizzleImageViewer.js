import { HIDE_IMAGE_VIEWER } from '../store/ui/types'
import { connect } from 'react-redux'
import RizzleImageViewer from '../components/RizzleImageViewer.js'

const mapStateToProps = (state) => {
  return {
    isVisible: state.ui.imageViewerVisible,
    url: state.ui.imageViewerUrl,
    itemId: state.ui.imageViewerItemId
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    hideImageViewer: () => dispatch({
      type: HIDE_IMAGE_VIEWER
    })
  }
}

let RizzleImageViewerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RizzleImageViewer)

export default RizzleImageViewerContainer
