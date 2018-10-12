import React from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import TouchableScale from 'react-native-touchable-scale'
import {Transition} from 'react-navigation-fluid-transitions'
import {Surface} from 'gl-react-native'
const {Image: GLImage} = require('gl-react-image')
import {ContrastSaturationBrightness} from 'gl-react-contrast-saturation-brightness'
import ColorBlending from 'gl-react-color-blending'
import { blendColor, hslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedUnreadCounter from './FeedUnreadCounter'

class Feed extends React.PureComponent {

  constructor (props) {
    super(props)
    this.props = props

    this.scaleAnim = new Animated.Value(1)
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   console.log(`${this.props.feedTitle} - ${this.props.numFeedItems} :: ${nextProps.numFeedItems}`)
  //   return this.props.navigation.state.routeName === 'Feeds' &&
  //     this.props.numFeedItems !== nextProps.numFeedItems
  // }

  render = () => {
    console.log(`Render ${this.props.feedTitle}`)
    const {
      coverImageDimensions,
      coverImagePath,
      feedTitle,
      feedColor,
      feedId,
      numFeedItems
    } = this.props
    console.log('Render feed: ' + feedTitle)
    const that = this
    const width = Dimensions.get('window').width
    const margin = width * 0.05
    const cardWidth = width - margin * 2
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'center'
    }

    const shouldSetResponder = e => true

    return (
      <Transition appear='left'>
        <TouchableScale
          friction={1}
          onPress={() => that.props.navigation.navigate('FeedInfo', {
          feedTitle,
          feedColor,
          feedId,
          coverImageDimensions,
          coverImagePath,
          numFeedItems
        })}>
          <View
            style={{
              height: cardWidth / 2,
              width: cardWidth,
              borderRadius: 20,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              backgroundColor: hslString(feedColor, 'desaturated'),
              marginBottom: margin,
              overflow: 'hidden',
              position: 'relative',
              shadowColor: 'black',
              shadowRadius: 10,
              shadowOpacity: 0.3,
              // shadowOffset: {
              //   width: 10,
              //   height: 10
              // },
              overflow: 'visible'
            }}>
            <Transition shared={`feed-cover-${feedId}`}>
              <View style={{
                height: '100%',
                width: '100%',
                borderRadius: 20,
                overflow: 'hidden'
              }}>
                <FeedCoverImage
                  feedColor={this.props.feed}
                  coverImagePath={this.props.coverImagePath}
                  coverImageDimensions={this.props.coverImageDimensions}
                  width={cardWidth}
                  height={cardWidth * 0.5} />
              </View>
            </Transition>
            <View style={{
              // borderTopLeftRadius: 19,
              // borderTopRightRadius: 19,
              // height: cardWidth / 2,
              width: '100%',
              height: '100%',
              borderRadius: 20,
              paddingTop: margin * .5,
              paddingLeft: margin,
              paddingRight: margin,
              position: 'absolute',
              flex: 1,
              flexDirection: 'column',
              // justifyContent: 'center',
              alignItems: 'center',
              // justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}>
              <Transition shared={`feed-title-${feedId}`}>
                <Text style={{
                  ...textStyles,
                  color: hslString(feedColor, 'desaturated'),
                  fontFamily: 'IBMPlexSansCond-Bold',
                  fontSize: 20,
                  height: 60
                }}>{feedTitle}</Text>
              </Transition>
              <Transition shared={`feed-unread-counter-${feedId}`}>
                <FeedUnreadCounter
                  numFeedItems={numFeedItems}
                  feedColor={feedColor}
                />
              </Transition>
            </View>
          </View>
        </TouchableScale>
      </Transition>
    )
  }
}

export default Feed
