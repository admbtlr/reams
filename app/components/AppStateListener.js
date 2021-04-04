import React, { useEffect } from 'react'
import {
  AppState
} from 'react-native'
import Clipboard from "@react-native-community/clipboard"
import SharedGroupPreferences from 'react-native-shared-group-preferences'
import { parseString } from 'react-native-xml2js'

import { isIgnoredUrl, addIgnoredUrl } from '../storage/async-storage'
import log from '../utils/log'
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
