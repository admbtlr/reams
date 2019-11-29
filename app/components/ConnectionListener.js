import React from 'react'
import NetInfo from '@react-native-community/netinfo'

class ConnectionListener extends React.Component {
  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange)

    NetInfo.isConnected.fetch().done(isConnected => {
      this.props.isOnline(isConnected)
    })
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectionChange)
  }

  handleConnectionChange = (isConnected) => {
    this.props.isOnline(isConnected)
    console.log(`Is connected: ${isConnected}`)
  }

  render = () => {
    return null
  }
}

export default ConnectionListener
