import React from 'react'
import FeedItemContainer from '../containers/FeedItem.js'
import {Animated, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native'
import SwipeableViews from './SwipeableViews'

import {hslString} from '../utils/colors'

class FeedInfo extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.pulseOpacity = new Animated.Value(0)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true
  }

  componentDidMount () {
    this.pulseAnimation()
  }

  pulseAnimation () {
    Animated.sequence([
      Animated.timing(
        this.pulseOpacity,
        {
          toValue: 1,
          duration: 1000,
        }
      ),
      Animated.timing(
        this.pulseOpacity,
        {
          toValue: 0,
          duration: 1000,
        }
      )
    ]).start(event => {
      if (event.finished) {
        this.pulseAnimation()
      }
    })
  }

  render () {
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      fontSize: 22,
      lineHeight: 28,
      textAlign: 'center',
      marginBottom: 28
    }
    const isVisible = this.state && this.state.detailsVisible || false
    const { author, feed_title } = this.props.item

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 14,
        backgroundColor: hslString(this.props.item.styles.color),
        marginBottom: 0
      }}>
        <View style={{
          width: 1,
          height: 42,
          backgroundColor: 'white',
          marginBottom: 28,
          marginTop: 28
        }} />
        { this.props.item.author &&
          <Text style={ textStyles }>{ author && author.trim() }</Text>
        }
        { this.props.item.author &&
          <View style={{
            width: 1,
            height: 42,
            backgroundColor: 'white',
            marginBottom: 28
          }} />
        }
        <Text style={{
          ...textStyles,
          fontFamily: 'IBMPlexMono-Bold'
        }}>{ feed_title && feed_title.trim() }</Text>
        { isVisible &&
          <View>
            <Text style={{
              ...textStyles,
              color: 'rgba(0, 0, 0, 0.8)'
            }}>{this.props.numFeedItems} unread</Text>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                marginBottom: 28,
                height: 42
              }}
              onPress={() => {
                this.props.markAllRead(this.props.item.feed_id)
                console.log('MARK ALL READ!')
              }}>
                <Text style={{
                  ...textStyles,
                  textDecorationLine: 'underline',
                  color: 'rgba(0, 0, 0, 0.8)'
                }}>Mark all read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log('UNSUBSCRIBE!')
              }}>
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 42,
              }}>
                <Text style={{
                  ...textStyles,
                  textDecorationLine: 'underline',
                  color: 'rgba(0, 0, 0, 0.8)'
                }}>Unsubscribe</Text>
              </View>
            </TouchableOpacity>
          </View>
        }
        <TouchableWithoutFeedback
          onPress={() => {
            console.log('BUTTON PRESSED!')
            this.setState({
              detailsVisible: !isVisible
            })
          }}>
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: isVisible ? 14 : 28,
            width: 100,
            height: 42
          }}>
            <View style={{
              width: 1,
              height: 42,
              backgroundColor: 'white',
              transform: isVisible ? [{rotateZ: '90deg'}] : []
            }} />
            <Animated.View style={{
              width: 3,
              height: 42,
              top: -42,
              marginBottom: -42,
              backgroundColor: 'white',
              opacity: this.pulseOpacity,
              transform: isVisible ? [
                  { rotateZ: '90deg' }
                ] : [
                ],
              shadowRadius: 5,
              shadowColor: 'white',
              shadowOpacity: 1,
              shadowOffset: {
                width: 0,
                height: 0
              }
            }} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

}

export default FeedInfo
