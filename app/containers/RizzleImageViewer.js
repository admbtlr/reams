import { connect } from 'react-redux'
import RizzleImageViewer from '../components/RizzleImageViewer.js'

const mapStateToProps = (state) => {
  return {
    isVisible: state.ui.imageViewerVisible,
    url: state.ui.imageViewerUrl
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    hideImageViewer: () => dispatch({
      type: 'UI_HIDE_IMAGE_VIEWER'
    })
  }
}

let RizzleImageViewerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RizzleImageViewer)

export default RizzleImageViewerContainer
