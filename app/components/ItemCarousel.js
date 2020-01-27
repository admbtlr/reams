import React, { Fragment } from 'react'
import FeedItemContainer from '../containers/FeedItem.js'
import OnboardingContainer from '../containers/Onboarding.js'
import ItemsScreenOnboarding from './ItemsScreenOnboarding'
import { Text, View } from 'react-native'
import TextButton from './TextButton'
import SwipeableViews from './SwipeableViews'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'

export const BUFFER_LENGTH = 5

class ItemCarousel extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.renderSlide = this.renderSlide.bind(this)
    this.onChangeIndex = this.onChangeIndex.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    // don't update if the item type hasn't changed (unread <> saved)
    // or if the the items haven't changed
    // AND nextProps.index is within the (index + BUFFER_LENGTH)
    // OR if nextProps.index is the same as the index we're currently at)
    const stringifyBufferedItems = (props) => JSON
      .stringify(props.items.slice(this.props.index === 0 ?
        0 :
        - 1, this.props.index + BUFFER_LENGTH)
        .map(item => item._id))

    if (this.incomingIndex === null) {
      return nextProps.index !== this.props.index ||
        nextProps.displayMode !== this.props.displayMode
    } else {
      return nextProps === null ||
        nextProps.index - this.props.index >= BUFFER_LENGTH ||
        nextProps.displayMode !== this.props.displayMode ||
        stringifyBufferedItems(nextProps) !== stringifyBufferedItems(this.props)
    }
  }

  render () {
    const {
      displayMode,
      index,
      isItemsOnboardingDone,
      isOnboarding,
      items,
      navigation,
      numItems,
      setPanAnim,
      toggleDisplayMode
    } = this.props
    if (numItems > 0 || isOnboarding) {
      return (
        <Fragment>
          <SwipeableViews
            virtualBuffer={BUFFER_LENGTH}
            slideRenderer={this.renderSlide}
            onChangeIndex={this.onChangeIndex}
            slideCount={isOnboarding ? 2 : numItems}
            index={index}
            isOnboarding={isOnboarding}
            items={items}
            updateTimestamp={Date.now()}
            setPanAnim={setPanAnim}
          />
          { !isItemsOnboardingDone &&
            !isOnboarding &&
            numItems > 0 &&
            <ItemsScreenOnboarding /> }
        </Fragment>
      )
    } else {
      return <EmptyCarousel
        displayMode={displayMode}
        navigation={navigation}
        toggleDisplayMode={toggleDisplayMode}
      />
    }
  }

  onChangeIndex (index, lastIndex) {
    // workaround for a weird bug
    if (index % 1 !== 0) {
      return
    }
    this.incomingIndex = index
    this.props.updateCurrentIndex(index, lastIndex, this.props.displayMode, this.props.isOnboarding)
  }

  // cacheCoverImageComponent

  renderSlide ({_id, index, setTimerFunction, isVisible}) {
    if (this.props.isOnboarding) {
      return <OnboardingContainer
        index={index}
        key={index}
        navigation={this.props.navigation}
      />
    }
    if (index >= 0 && index < this.props.numItems) {
      return <FeedItemContainer
        _id={_id}
        key={_id}
        setTimerFunction={setTimerFunction}
        isVisible={isVisible}
      />
    }
  }
}

export default ItemCarousel

const EmptyCarousel = ({ displayMode, navigation, toggleDisplayMode }) => {
  return <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '66%',
    marginLeft: '16.67%'
  }}>
    { displayMode === 'saved' ?
      <Fragment>
        <Text style={{
          ...textInfoBoldStyle,
          fontSize: 22,
          marginBottom: 24
        }}>This is the area for your saved stories, but you don’t have any right now</Text>
        <Text style={{
          ...textInfoStyle,
          fontSize: 20,
          marginBottom: 24
        }}>You can save stories from your feed, or direct from Safari using the Rizzle Share Extension</Text>
        <TextButton
          text='Go to your feed'
          onPress={ () => {
            toggleDisplayMode(displayMode)
          }} />
      </Fragment> :
      <Fragment>
        <Text style={{
          ...textInfoBoldStyle,
          fontSize: 22,
          marginBottom: 24
        }}>You have no unread stories! 🎉</Text>
        <Text style={{
          ...textInfoStyle,
          fontSize: 20,
          marginBottom: 24
        }}>Celebrate by going outside for a bit. Or you could just add some more feeds...</Text>
        <TextButton
          text='Add some feeds'
          onPress={ () => {
            navigation.navigate('Feeds')
          }} />
      </Fragment>
    }
  </View>
}
