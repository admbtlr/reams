import React from 'react'
import {
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import {Transition} from 'react-navigation-fluid-transitions'
import FeedCoverImage from './FeedCoverImage'
import FeedUnreadCounter from './FeedUnreadCounter'
import { hslString } from '../utils/colors'
import { getMargin } from 'utils'

class FeedInfoScreen extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  render = () => {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const margin = getMargin()
    const feedTitle = this.props.navigation.getParam('feedTitle')
    const feedColor = this.props.navigation.getParam('feedColor')
    const feedId = this.props.navigation.getParam('feedId')
    const coverImagePath = this.props.navigation.getParam('coverImagePath')
    const coverImageDimensions = this.props.navigation.getParam('coverImageDimensions')
    const numFeedItems = this.props.navigation.getParam('numFeedItems')

    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hslString('rizzleBG')
      }}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width,
          paddingTop: 100
        }}>
          <Transition shared={`feed-cover-${feedId}`}>
            <FeedCoverImage
              feedColor={feedColor}
              coverImagePath={coverImagePath}
              coverImageDimensions={coverImageDimensions}
              width={width}
              height={height * .5}
              style={{
                position: 'absolute',
                top: 0,
                left: 0
              }} />
          </Transition>
          <Transition shared={`feed-title-${feedId}`}>
            <Text style={{
              fontFamily: 'IBMPlexMono-Bold',
              fontSize: 48,
              marginTop: 48,
              marginBottom: 24,
              textAlign: 'center',
              color: 'white'
            }}>{feedTitle}</Text>
          </Transition>
          <Transition shared={`feed-unread-counter-${feedId}`}>
            <FeedUnreadCounter
              numFeedItems={numFeedItems}
              feedColor={feedColor}
            />
          </Transition>
        </View>
        <Transition appear='bottom'>
          <View style={{
            flex: 1,
            height: height * .5,
            width,
            backgroundColor: 'white',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}>
            <TouchableWithoutFeedback
              onPress={e => {
                this.props.navigation.navigate('Items')
              }}>
              <View>
                <Text style={{
                  fontFamily: 'IBMPlexMono-Light',
                  color: 'black'
                }}>Go to items view</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPress={e => {
                this.props.navigation.navigate('Feeds')
              }}>
              <View>
                <Text style={{
                  fontFamily: 'IBMPlexMono-Light',
                  color: 'black'
                }}>Go to feeds view</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Transition>
      </View>
    )
  }
}

export default FeedInfoScreen
