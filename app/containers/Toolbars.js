import { connect } from 'react-redux'
import Toolbars from '../components/Toolbars.js'

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

let ToolbarsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Toolbars)

export default ToolbarsContainer
