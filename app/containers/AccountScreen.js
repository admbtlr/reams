import { connect } from 'react-redux'
import AccountScreen from '../components/AccountScreen.js'
// import { itemDidScroll } from '../redux/actions/item.js'


const mapStateToProps = (state) => {
  return {
    user: state.user,
    backend: state.config.backend
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showModal: (modalProps) => dispatch({
      type: 'UI_SHOW_MODAL',
      modalProps
    })
  }
}

let AccountScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountScreen)

export default AccountScreenContainer
