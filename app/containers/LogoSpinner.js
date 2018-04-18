import { connect } from 'react-redux'
import LogoSpinner from '../components/LogoSpinner.js'

const mapStateToProps = (state) => {
  return {
    showLoadingAnimation: state.ui.showLoadingAnimation
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

let LogoSpinnerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogoSpinner)

export default LogoSpinnerContainer
