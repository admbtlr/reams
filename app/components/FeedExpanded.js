import React from 'react'
import {
  Dimensions,
  Text,
  View
} from 'react-native'
import { blendColor, hslString } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedIconCorner from './FeedIconCorner'
import FeedDetails, { FeedStats } from './FeedDetails'
import XButton from './XButton'
import FeedExpandedOnboarding from './FeedExpandedOnboarding'
import { fontSizeMultiplier, getMargin } from '../utils'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'
import { ScrollView } from 'react-native-gesture-handler'

class FeedExpanded extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
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
      close,
      feed,
    } = this.props

    if (!feed) return null

    const { iconDimensions } = feed

    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexSans-Light',
      textAlign: 'left'
    }

    const dim = Dimensions.get('window')
    const screenWidth = dim.width
    const margin = getMargin()
    const screenHeight = dim.height

    const EnclosingView = screenWidth < 500 ? View : View

    return (
      <EnclosingView 
        alwaysBounceVertical={false}
        bounces={false}
        overScrollMode='never'
        showsVerticalScrollIndicator={false}
        style={{
          padding: 0,
          margin: 0,
          minHeight: '100%',
          flex: 1
        }}>
        <View
          style={{
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: hslString(feed.color, 'desaturated'),
            // position: 'relative',
            overflow: 'hidden',
            flex: 0,
            flexGrow: 1,
            width: screenWidth,
            // ...positionStyles
          }}>
          <View
            ref={c => this.imageView = c}
            style={{
              // height: screenHeight * 0.6,
              width: '100%',
              minHeight: 200,
              overflow: 'hidden',
              flex: 1
            }}>
            <FeedCoverImage
              feed={feed}
              width={screenWidth}
              height={screenHeight * 0.6}
              setCachedCoverImage={this.props.setCachedCoverImage} 
              removeCoverImage={this.props.removeCoverImage} />
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
            paddingLeft: screenWidth < 500 ? margin * 0.5 : screenWidth * 0.04,
            paddingRight: 40,
            paddingBottom: margin * 0.5,
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
              { feed.description != null && feed.description.length > 0 && <Text style={{
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
                ...textInfoStyle('white'),
                marginLeft: 0,
                fontSize: 16 * fontSizeMultiplier()
              }}>{feed.numUnread} unread stor{feed.numUnread === 1 ? 'y' : 'ies'} • <FeedStats feed={feed} /></Text>
              
            </View>
          </View>
          {/* <FeedIconCorner
            feed={feed}
            iconDimensions={iconDimensions}
            extraStyle={{
              bottom: 0
            }}
          /> */}
        </View>
        <View style={{
          backgroundColor: hslString('rizzleBG'),
          flex: 0,
          padding: 0,
          margin: 0,
          flexGrow: 0
        }}>
          <FeedDetails { ...this.props } />
        </View>
        <View style={{
          // opacity: this.expandAnim,
          position: 'absolute',
          right: 10 * fontSizeMultiplier(),
          top: 10 * fontSizeMultiplier()
        }}>
          <XButton
            isLight={true}
            onPress={close} />
        </View>
        { /*isFeedOnboardingDone || <FeedExpandedOnboarding /> */}
      </EnclosingView>
    )
  }
}

export default FeedExpanded
