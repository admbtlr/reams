import { connect } from 'react-redux'
import AccountScreen from '../components/AccountScreen.js'

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
    }),
    setBackend: (backend, credentials) => dispatch({
      type: 'CONFIG_SET_BACKEND',
      backend,
      credentials
    }),
    unsetBackend: () => dispatch({
      type: 'CONFIG_UNSET_BACKEND'
    }),
    setSignInEmail: (email) => dispatch({
      type: 'USER_SET_SIGN_IN_EMAIL',
      email
    })
  }
}

let AccountScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountScreen)

export default AccountScreenContainer
