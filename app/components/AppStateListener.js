import React, { useEffect } from 'react'
import {
  AppState
} from 'react-native'
import DarkModeListener from './DarkModeListener'

class AppStateListener extends React.Component {

  MINIMUM_UPDATE_INTERVAL = 600000 // 10 minutes

  constructor (props) {
    super(props)
    this.props = props

    this.handleAppStateChange = this.handleAppStateChange.bind(this)

    AppState.addEventListener('change', this.handleAppStateChange)

    this.props.checkBuckets()
  }

  async handleAppStateChange (nextAppState) {
    console.log('NEXT APP STATE: ' + nextAppState)
    console.log('PREV APP STATE: ' + this.props.appState)
    if (this.props.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.props.appWentActive()
      this.setState({
        doNothing: Date.now()
      })
      this.props.checkBuckets()

      if (!global.isStarting && (Date.now() - this.props.lastUpdated > this.MINIMUM_UPDATE_INTERVAL)) {
        this.props.fetchData()
      }
    } else if (this.props.appState.match(/active/) &&
      (nextAppState === 'inactive' ||
      nextAppState === 'background')) {
      this.props.appWentInactive()
    }
  }

  render () {
    return <DarkModeListener />
  }
}

export default AppStateListener
