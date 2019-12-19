import { connect } from 'react-redux'
import RizzleModal from '../components/RizzleModal.js'

const mapStateToProps = (state) => {
  return {
    isVisible: state.ui.modalVisible,
    modalProps: state.ui.modalProps,
    hiddenModals: state.ui.hiddenModals
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    modalHide: () => dispatch({
      type: 'UI_HIDE_MODAL'
    }),
    toggleHide: modalName => dispatch({
      type: 'UI_TOGGLE_HIDE_MODAL',
      modalName
    })
  }
}

let RizzleModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RizzleModal)

export default RizzleModalContainer
