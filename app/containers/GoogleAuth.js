import { connect } from 'react-redux'
import { SET_BACKEND } from '../store/config/types'
import GoogleAuth from '../components/GoogleAuth'

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    setBackend: (backend, credentials) => dispatch({
      type: SET_BACKEND,
      backend,
      credentials
    })
  }
}

let GoogleAuthContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GoogleAuth)

export default GoogleAuthContainer
