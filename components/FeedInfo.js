import React from 'react'
import {Animated, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native'

import {hslString} from '../utils/colors'

class FeedInfo extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.pulseOpacity = new Animated.Value(0)
    this.detailsHeight = new Animated.Value(0)
    this.detailsOpacity = new Animated.Value(0)

    this.state = {
      detailsVisible: false
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true
  }

  componentDidMount () {
    this.pulseAnimation()
    this.expandAnimation()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.detailsVisible !== this.state.detailsVisible) {
      this.expandAnimation()
    }
  }

  pulseAnimation () {
    Animated.sequence([
      Animated.timing(
        this.pulseOpacity,
        {
          toValue: 1,
          duration: 1000,
          isInteraction: false,
          useNativeDriver: false
        }
      ),
      Animated.timing(
        this.pulseOpacity,
        {
          toValue: 0,
          duration: 1000,
          isInteraction: false,
          useNativeDriver: false
        }
      )
    ]).start(event => {
      if (event.finished) {
        this.pulseAnimation()
      }
    })
  }

  expandAnimation () {
    const springConfig = {
      speed: 20,
      bounciness: 12,
      toValue: this.state.detailsVisible ? 168 : 0,
      duration: 200,
      useNativeDriver: false
    }
    Animated.spring(
      this.detailsHeight,
      springConfig
    ).start()
    Animated.spring(
      this.detailsOpacity,
      {
        ...springConfig,
        toValue: this.state.detailsVisible ? 1 : 0
      }
    ).start()
  }

  render () {
    const { author, feed_color, feed_title, styles } = this.props.item
    // const textStyles = {
    //   color: 'white',
    //   fontFamily: 'IBMPlexMono-Light',
    //   fontSize: 22,
    //   lineHeight: 28,
    //   textAlign: 'center',
    //   marginBottom: 28
    // }
    const textStyles = {
      color: hslString(feed_color ||  styles.color, 'desaturated'),
      fontFamily: 'IBMPlexMono-Light',
      fontSize: 22,
      lineHeight: 28,
      textAlign: 'center',
      marginBottom: 14
    }
    const isVisible = this.state && this.state.detailsVisible || false

    // return (
    //   <View style={{
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     padding: 14,
    //     backgroundColor: hslString(feed_color ||  styles.color, 'desaturated'),
    //     marginBottom: 0
    //   }}>
    //     <View style={{
    //       width: 1,
    //       height: 42,
    //       backgroundColor: 'white',
    //       marginBottom: 28,
    //       marginTop: 28
    //     }} />
    //     { this.props.item.author &&
    //       <Text style={{
    //         ...textStyles,
    //         fontFamily: 'IBMPlexMono-LightItalic' }}>{ author && author.trim() }</Text>
    //     }
    //     <Text style={{
    //       ...textStyles,
    //       fontFamily: 'IBMPlexMono-Bold'
    //     }}>{ feed_title && feed_title.trim() }</Text>
    //     <Animated.View style={{
    //       height: this.detailsHeight,
    //       opacity: this.detailsOpacity
    //     }}>
    //       <Text style={{
    //         ...textStyles,
    //         color: 'rgba(0, 0, 0, 0.8)'
    //       }}>{this.props.numFeedItems} unread</Text>
    //       <TouchableOpacity
    //         style={{
    //           alignItems: 'center',
    //           marginBottom: 28,
    //           height: 42
    //         }}
    //         onPress={() => {
    //           this.props.markAllRead(this.props.item.feed_id)
    //           console.log('MARK ALL READ!')
    //         }}>
    //           <Text style={{
    //             ...textStyles,
    //             textDecorationLine: 'underline',
    //             color: 'rgba(0, 0, 0, 0.8)'
    //           }}>Mark all read</Text>
    //       </TouchableOpacity>
    //       <TouchableOpacity
    //         onPress={() => {
    //           this.props.unsubscribe(this.props.item.feed_id)
    //           console.log('UNSUBSCRIBE!')
    //         }}>
    //         <View style={{
    //           justifyContent: 'center',
    //           alignItems: 'center',
    //           height: 42,
    //         }}>
    //           <Text style={{
    //             ...textStyles,
    //             textDecorationLine: 'underline',
    //             color: 'rgba(0, 0, 0, 0.8)'
    //           }}>Unsubscribe</Text>
    //         </View>
    //       </TouchableOpacity>
    //     </Animated.View>
    //     <TouchableWithoutFeedback
    //       onPress={() => {
    //         console.log('BUTTON PRESSED!')
    //         this.setState({
    //           detailsVisible: !isVisible
    //         })
    //       }}>
    //       <View style={{
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         marginBottom: isVisible ? 14 : 28,
    //         width: 100,
    //         height: 42
    //       }}>
    //         <View style={{
    //           width: 1,
    //           height: 42,
    //           backgroundColor: 'white',
    //           transform: isVisible ? [{rotateZ: '90deg'}] : []
    //         }} />
    //         <Animated.View style={{
    //           width: 3,
    //           height: 42,
    //           top: -42,
    //           marginBottom: -42,
    //           backgroundColor: 'white',
    //           opacity: this.pulseOpacity,
    //           transform: isVisible ? [
    //               { rotateZ: '90deg' }
    //             ] : [
    //             ],
    //           shadowRadius: 5,
    //           shadowColor: 'white',
    //           shadowOpacity: 1,
    //           shadowOffset: {
    //             width: 0,
    //             height: 0
    //           }
    //         }} />
    //       </View>
    //     </TouchableWithoutFeedback>
    //   </View>
    // )

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 14,
        backgroundColor: hslString('bodyBG'), // TODO!
        marginBottom: 0
      }}>
        <View style={{
          width: 28,
          height: 2,
          backgroundColor: hslString(feed_color ||  styles.color, 'desaturated'),
          marginBottom: 14,
          marginTop: 14
        }} />
        { this.props.item.author &&
          <Text style={{
            ...textStyles,
            fontFamily: 'IBMPlexMono-LightItalic' }}>{ author && author.trim() }</Text>
        }
        <Text style={{
          ...textStyles,
          fontFamily: 'IBMPlexMono-Bold'
        }}>{ feed_title && feed_title.trim() }</Text>
        <Animated.View style={{
          height: this.detailsHeight,
          opacity: this.detailsOpacity
        }}>
          <Text style={{
            ...textStyles,
            color: 'rgba(0, 0, 0, 0.8)'
          }}>{this.props.numFeedItems} unread</Text>
          <TouchableOpacity
            style={{
              alignItems: 'flex-start',
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
              this.props.unsubscribe(this.props.item.feed_id)
              console.log('UNSUBSCRIBE!')
            }}>
            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 28,
            }}>
              <Text style={{
                ...textStyles,
                textDecorationLine: 'underline',
                color: 'rgba(0, 0, 0, 0.8)'
              }}>Unsubscribe</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
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
            width: 28,
            height: 28
          }}>
            <View style={{
              height: 2,
              width: 28,
              backgroundColor: hslString(feed_color ||  styles.color, 'desaturated'),
              transform: isVisible ? [{rotateZ: '0deg'}] : []
            }} />
            <Animated.View style={{
              height: 5,
              width: 28,
              top: -3,
              marginBottom: -5,
              backgroundColor: hslString(feed_color ||  styles.color, 'desaturated'),
              opacity: this.pulseOpacity,
              transform: isVisible ? [
                  { rotateZ: '0deg' }
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
