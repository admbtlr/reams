import { connect } from 'react-redux'
import { IS_ONLINE } from '../store/config/types'
import ConnectionListener from '../components/ConnectionListener.js'


const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    isOnline: (isOnline) => dispatch({
      type: IS_ONLINE,
      isOnline
    })
  }
}

let ConnectionListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectionListener)

export default ConnectionListenerContainer
