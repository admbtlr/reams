import React from 'react'
import {
  Dimensions,
  Text,
  View
} from 'react-native'
import { blendColor, hslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedIconCorner from './FeedIconCorner'
import FeedDetails from './FeedDetails'
import XButton from './XButton'
import FeedExpandedOnboarding from './FeedExpandedOnboarding'
import { fontSizeMultiplier } from '../utils'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'

class FeedExpanded extends React.Component {

  constructor (props) {
    super(props)
    this.props = props

    const dim = Dimensions.get('window')
    this.screenWidth = dim.width
    this.margin = this.screenWidth * 0.05
    this.screenHeight = dim.height
  }

  setFeedExpanded () {
    this.isExpanded = true
  }

  deselectFeed ([position, finished]) {
    if (position <= 0 && finished > 0) {
      if (this.isExpanded) {
        this.props.deselectFeed()
        this.isExpanded = false
      } else {
        this.isExpanded = true
      }
    }
  }

  render () {
    const {
      clearReadItems,
      close,
      feed,
      filterItems,
      isFeedOnboardingDone,
      navigation,
      setIndex
    } = this.props

    if (!feed) return null

    const { iconDimensions } = feed

    // just don't show favicons
    // TODO: delete them completely?
    const showFavicon = false

    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'left'
    }

    return (
      <View style={{
        padding: 0,
        margin: 0
      }}>
        <View
          style={{
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: hslString(feed.color, 'desaturated'),
            // position: 'relative',
            overflow: 'hidden',
            flex: 2,
            width: this.screenWidth
            // ...positionStyles
          }}>
          <View
            ref={c => this.imageView = c}
            style={{
              // height: '100%',
              width: '100%'
            }}>
            <FeedCoverImage
              feed={feed}
              width={this.screenWidth}
              height={this.screenHeight * 0.5}
              setCachedCoverImage={this.props.setCachedCoverImage} />
            <View style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }} />
          </View>
          <View style={{
            width: '100%',
            paddingLeft: this.margin * 0.5,
            paddingRight: 40,
            paddingBottom: this.margin * 0.5,
            position: 'absolute',
            bottom: 0,
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}>
            <View style={{
              paddingLeft: 4,
              paddingRight: 4,
              paddingBottom: 2
            }}>
              <Text style={{
                ...textStyles,
                flexWrap: 'wrap',
                fontFamily: 'IBMPlexSansCond-Bold',
                fontSize: 32 * fontSizeMultiplier(),
                lineHeight: 32 * fontSizeMultiplier()
              }}>{feed.title}</Text>
              { feed.description && feed.description.length > 0 && <Text style={{
                ...textStyles,
                fontFamily: 'IBMPlexSans',
                fontSize: (feed.description.length > 100 ? 18 : 20) *
                  fontSizeMultiplier(),
                textAlign: 'left',
                marginBottom: 16 * fontSizeMultiplier()
              }}>{ feed.description }</Text> }
            </View>
            <View style={{
              paddingBottom: 5,
              paddingLeft: 4,
              paddingRight: 10
            }}>
              <Text style={{
                ...textStyles,
                fontFamily: 'IBMPlexMono-Light',
                fontSize: 16 * fontSizeMultiplier()
              }}>{feed.numUnread} unread stories</Text>
            </View>
          </View>
          <FeedIconCorner
            feed={feed}
            iconDimensions={iconDimensions}
            extraStyle={{
              bottom: 0
            }}
          />
        </View>
        <View style={{
          backgroundColor: hslString('rizzleBG'),
          flex: 3,
          padding: 0,
          margin: 0
        }}>
          <FeedDetails { ...this.props } />
        </View>
        <View style={{
          // opacity: this.expandAnim,
          position: 'absolute',
          right: 10,
          top: 10
        }}>
          <XButton
            isLight={true}
            onPress={close} />
        </View>
        { /*isFeedOnboardingDone || <FeedExpandedOnboarding /> */}
      </View>
    )
  }
}

export default FeedExpanded
