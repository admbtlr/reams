import React, { ComponentClass } from 'react'
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { hslString, rgbStringToHsl } from '../utils/colors'
import FeedCoverImage from './FeedCoverImage'
import FeedLikedMuted from './FeedLikedMuted'
import FeedIconContainer from '../containers/FeedIcon'
import FeedExpandedContainer from '../containers/FeedExpanded'
import { fontSizeMultiplier, getInset, getMargin } from '../utils'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { SharedElement } from 'react-navigation-shared-element'
import { Feed } from '../store/feeds/types'
import { WrappedFeed } from 'containers/FeedContracted'

class FeedContracted extends React.PureComponent {

  props: any
  opacityAnim: Animated.Value
  mainView: React.RefObject<View>
  imageView: React.RefObject<View>

  constructor (props: any) {
    super(props)
    this.props = props
    this.opacityAnim = new Animated.Value(1)
    this.mainView = React.createRef<View>()
    this.imageView = React.createRef<View>()

    this.onLongPress = this.onLongPress.bind(this)
    this.onPress = this.onPress.bind(this)
  }

  navigateToItems = (x: number, y: number, width: number, height: number) => {
    const { navigation } = this.props
    navigation.navigate('Items', { 
      feedCardX: Math.round(x),
      feedCardY: Math.round(y),
      feedCardWidth: Math.round(width),
      feedCardHeight: Math.round(height),
      toItems: true
    })
  }

  onPress = (e: GestureResponderEvent) => {
    const { clearReadItems, feed, filterItems, setIndex, navigation, type } = this.props
    // this.imageView.measure(this.measured)
    // navigation.push('ModalWithGesture', {
    //   childView: <FeedExpandedContainer
    //       feed={feed}
    //       close={() => navigation.navigate('Main')}
    //       navigation={navigation}
    //     />
    // })
    this.opacityAnim.setValue(0.2)
    Animated.timing(this.opacityAnim, {
      toValue: 0,
      delay: 200,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      Animated.timing(this.opacityAnim, {
        toValue: 1,
        delay: 500,
        duration: 200,
        useNativeDriver: true
      }).start()
    })
    clearReadItems()
    filterItems(type === 'all' ? null : this.props[type]._id,
      type === 'all' ? null : this.props[type].title || this.props[type].name,
      type === 'all' ? null : type
    )
    setIndex(0)
    this.mainView.measureInWindow(this.navigateToItems.bind(this))
  }

  onLongPress = (e: GestureResponderEvent) => {
    ReactNativeHapticFeedback.trigger("impactLight", {})
    const { feeds, navigation, title, type } = this.props
    // this.imageView.measure(this.measured)
    if (type === 'feed') {
      navigation.push('ModalWithGesture', {
        childView: <FeedExpandedContainer
            feed={feeds[0].feed}
            close={() => navigation.navigate('Main')}
            navigation={navigation}
          />
      })
    } else if (type === 'category') {
      const modalText = [
        {
          text: 'Edit tag',
          style: ['title']
        }
      ]
      this.props.showModal({
        modalText,
        modalHideCancel: false,
        modalShow: true,
        inputs: [
          {
            label: 'Tag',
            name: 'categoryName',
            type: 'text',
            value: title
          }
        ],
        deletableRows: feeds.map((feed: WrappedFeed) => ({
          bgColor: feed.color ? hslString(feed.color) : hslString('rizzleText'),
          title: feed.feed.title,
          id: feed.feed._id
        })),
        deleteButton: true,
        deleteButtonText: 'Delete tag',
        modalOnDelete: () => {
          this.props.deleteCategory(this.props.category)
        },
        modalOnOk: (state: any) => {
          console.log(state)
          const category = {
            _id: this.props.category._id,
            id: this.props.category.id,
            name: state.categoryName || this.props.category.name,
            feeds: state.deletableRows.map((dr: Feed) => dr.id)
          }
          this.props.updateCategory(category)
        }
      })
    }  
  }

  render = () => {
    const { count, feeds, index, key, title, type, width } = this.props
    const textStyles = {
      color: 'white',
      fontFamily: 'IBMPlexMono-Light',
      textAlign: 'left'
    }

    const shadowStyle = {
      shadowColor: 'black',
      shadowRadius: 5,
      shadowOpacity: 0.2,
      shadowOffset: {
        width: -5,
        height: 5
      }
    }

    const dim = Dimensions.get('window')
    const screenWidth = dim.width
    const margin = getMargin()
    const cardWidth = width < 500 ?
      width :
      (width - margin) / 2
    const screenHeight = dim.height

    const cardHeight = screenWidth < 500 || screenHeight < 500 ?
      cardWidth / 2 :
      cardWidth

    const numUnread = feeds.reduce((acc: number, feed: WrappedFeed) => {
      if (!feed) {
        console.log('feed is null')
      }
      return acc + feed.feedItems.length
    }, 0)

    const iconDimensions = feeds.length === 1 ?
      feeds[0].feedLocal && feeds[0].feedLocal.cachedIconDimensions :
      null

    // if (feeds.length === 0) {
    //   return null
    // }

    const cardSizeDivisor = screenWidth > 500 ? 
      (feeds.length > 15 ? 4 :
        feeds.length > 11 ? 3 :
        feeds.length > 3 ? 2 :
        feeds.length > 1 ? 1 :
        0) :
      (feeds.length > 18 ? 3.01 :
        feeds.length > 8 ? 2.1 :
        feeds.length > 1 ? 1.001 :
        0)

    return (
      <TouchableOpacity
        onPress={this.onPress}
        onLongPress={this.onLongPress}
      >
        <Animated.View
          ref={(c: React.RefObject<View>) => this.mainView = c}
          style={{
            flex: 1,
            height: cardHeight,
            width: cardWidth,
            marginBottom: margin,
            marginRight: (index % 2 === 0 && screenWidth > 500 && count > 1) ?
              margin :
              0,
            opacity: this.opacityAnim,
            overflow: 'visible',
            // transform: [
            //   {
            //     scaleX: this._scale,
            //     scaleY: this._scale
            //   }
            // ]
          }}
        >
          <View
            style={{
              height: cardHeight,
              width: cardWidth,
              borderRadius: 16,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              backgroundColor: type !== 'feed' ? 'black' : hslString(feeds[0].feed.color, 'desaturated'),
              position: 'relative',
              overflow: 'visible',
              // borderWidth: type == 'feed' ? 0 : 5,
              // borderColor: hslString('white'),
              ...shadowStyle
          }}>
            <View
              ref={(c: React.RefObject<View>) => this.imageView = c}
              style={{
                backgroundColor: 'white',
                height: '100%',
                width: '100%',
                borderRadius: 16,
                overflow: 'hidden',
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap'
            }}>
              { feeds.map((feed: WrappedFeed, index: number, feeds: WrappedFeed[]) => (
                <View 
                  key={feed.feedId}
                  style={{
                    backgroundColor: hslString(feed.color, 'desaturated'),
                    width: feeds.length > 1 ? cardHeight / cardSizeDivisor : cardWidth,
                    height: feeds.length > 1 ? cardHeight / cardSizeDivisor : cardHeight
                  }}>
                  <FeedCoverImage
                    feed={feed}
                    width={feeds.length > 1 ? cardHeight / cardSizeDivisor : cardWidth}
                    height={feeds.length > 1 ? cardHeight / cardSizeDivisor : cardHeight}
                    setCachedCoverImage={this.props.setCachedCoverImage}
                    removeCoverImage={this.props.removeCoverImage} />
                </View>
              )) }
            </View>
            <View style={{
              // borderTopLeftRadius: 19,
              // borderTopRightRadius: 19,
              // height: cardWidth / 2,
              width: '100%',
              height: '100%',
              borderRadius: 16,
              // paddingTop: margin * .5,
              paddingLeft: margin * 0.5,
              paddingRight: margin * 0.5,
              paddingBottom: margin * 0.5,
              position: 'absolute',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              // justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}>
              { type === 'feed' && <FeedLikedMuted feed={feeds[0]} /> }
              <View style={{
                paddingLeft: 4,
                paddingRight: 40,
                // paddingBottom: 2,
                flexDirection: 'row'
              }}>
                <Text style={{
                  ...textStyles,
                  flexWrap: 'wrap',
                  fontFamily: 'IBMPlexSansCond-Bold',
                  fontSize: 24 * fontSizeMultiplier(),
                  lineHeight: 28 * fontSizeMultiplier()
                }}>{title}</Text>
              </View>
              <View style={{
                paddingLeft: 4,
                paddingRight: 4,
                paddingBottom: 2
              }}>
                <Text style={{
                  ...textStyles,
                  fontFamily: 'IBMPlexMono-Light',
                  fontSize: 16 * fontSizeMultiplier()
                }}>{numUnread} unread</Text>
              </View>
            </View>
          </View>
          { type == 'feed' &&
            <View
              style={{
                height: cardHeight,
                width: cardWidth,
                borderRadius: 16,
                position: 'absolute',
                left: 0,
                top: 0,
                backgroundColor: 'transparent',
                overflow: 'hidden'
            }}>
              <View style={{
                backgroundColor: hslString(feeds[0].feed.color),
                position: 'absolute',
                bottom: -65,
                right: -65,
                zIndex: 5,
                width: 130,
                height: 130,
                transform: [{
                  rotateZ: '45deg'
                }]
              }} />
              <View style={{
                position: 'absolute',
                bottom: 10,
                right: 5,
                zIndex: 10
              }}>
                <FeedIconContainer
                  feed={feeds[0].feed}
                  iconDimensions={iconDimensions}
                />
              </View>
            </View>
          }
        </Animated.View>
      </TouchableOpacity>
    )
  }
}

export default FeedContracted
