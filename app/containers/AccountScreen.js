import { connect } from 'react-redux'
import { SET_BACKEND, SET_EXTRA_BACKEND, SET_SIGN_IN_EMAIL, UNSET_BACKEND } from '../store/config/types'
import { 
  SHOW_MODAL
} from '../store/ui/types'
import AccountScreen from '../components/AccountScreen.js'

const mapStateToProps = (state) => {
  return {
    user: state.user,
    isFeedbin: !!state.user.backends?.find(b => b.name === 'feedbin'),
    isReadwise: !!state.user.backends?.find(b => b.name === 'readwise'),
    displayMode: state.itemsMeta.display,
    isDarkMode: state.ui.isDarkMode,
    isPortrait: state.config.orientation === 'portrait',
    hasFeeds: state.feeds.feeds.length > 0,
    isOnboarding: state.config.isOnboarding
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showModal: (modalProps) => dispatch({
      type: SHOW_MODAL,
      modalProps
    }),
    setBackend: (backend, credentials) => {
      dispatch({
        type: UNSET_BACKEND
      })
      dispatch({
        type: SET_BACKEND,
        backend,
        credentials
      })
    },
    unsetBackend: (backend) => {
      dispatch({
        type: UNSET_BACKEND,
        backend
      })
    },
    setExtraBackend: (backend, credentials) => {
      dispatch({
        type: SET_EXTRA_BACKEND,
        backend,
        credentials
      })
    },
    unsetExtraBackend: (backend) => {
      dispatch({
        type: SET_EXTRA_BACKEND,
        backend
      })
    },
    setSignInEmail: (email) => dispatch({
      type: SET_SIGN_IN_EMAIL,
      email
    }),
    setDisplayMode: (displayMode) => {
      return dispatch({
        type: 'SET_DISPLAY_MODE',
        displayMode
      })
    },
  }
}

let AccountScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountScreen)

export default AccountScreenContainer
