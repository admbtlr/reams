import { connect } from 'react-redux'
import ConnectionListener from '../components/ConnectionListener.js'


const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    isOnline: (isOnline) => dispatch({
      type: 'CONFIG_IS_ONLINE',
      isOnline
    })
  }
}

let ConnectionListenerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectionListener)

export default ConnectionListenerContainer
