import { connect } from 'react-redux'
import RizzleModal from '../components/RizzleModal.js'

const mapStateToProps = (state) => {
  return {
    isVisible: state.ui.modalVisible,
    modalProps: state.ui.modalProps
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    modalHide: () => dispatch({
      type: 'UI_HIDE_MODAL'
    })
  }
}

let RizzleModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RizzleModal)

export default RizzleModalContainer
