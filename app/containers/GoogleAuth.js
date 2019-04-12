import { connect } from 'react-redux'
import GoogleAuth from '../components/GoogleAuth'

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    setBackend: (backend) => dispatch({
      type: 'CONFIG_SET_BACKEND',
      backend
    })
  }
}

let GoogleAuthContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GoogleAuth)

export default GoogleAuthContainer
