import React, { Fragment } from 'react'
import ItemsScreenOnboarding from './ItemsScreenOnboarding'
import { Text, View } from 'react-native'
import TextButton from './TextButton'
import SwipeableViews from './SwipeableViews'
import ToolbarsContainer from '../containers/Toolbars.js'
import { textInfoStyle, textInfoBoldStyle } from '../utils/styles'

export const BUFFER_LENGTH = 5

/*
props = {
  index,
  items
}

state = {
  index, // actual index
  items, // bufferedItems
  bufferIndex
}
*/

const getBufferedItems  = (items, index) => {
  const bufferStart = index === 0 ? index : index - 1
  const bufferEnd = index + BUFFER_LENGTH > items.length - 1 ?
    items.length :
    index + BUFFER_LENGTH + 1
  return items.slice(bufferStart, bufferEnd)
}


class ItemCarousel extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.index = -1,
    this.items = []
    this.bufferIndex = -1

    this.onChangeIndex = this.onChangeIndex.bind(this)
    this.decrementIndex = this.decrementIndex.bind(this)
    this.incrementIndex = this.incrementIndex.bind(this)
  }

  // static getDerivedStateFromProps (props, state) {
  //   if ()
  //   return {
  //     index: props.index,
  //     bufferedItems: getBufferedItems(props.items, props.index),
  //     bufferIndex: props.index === 0 ? 0 : 1
  //   }
  // }

  _stringifyBufferedItems = (items, index) => JSON
    .stringify(getBufferedItems(items, index)
      .map(item => item._id))

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.displayMode !== this.props.displayMode ||
      !(
        nextProps.index > this.initialIndex - 1 &&
        nextProps.index < this.initialIndex + BUFFER_LENGTH &&
        this._stringifyBufferedItems(nextProps.items, this.props.index) ===
          this._stringifyBufferedItems(this.props.items, this.props.index)
      )
  }

  componentDidUpdate () {
    this.index = this.initialIndex = this.props.index
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   // don't update if the item type hasn't changed (unread <> saved)
  //   // or if the the items haven't changed
  //   // AND nextProps.index is within the (index + BUFFER_LENGTH)
  //   // OR if nextProps.index is the same as the index we're currently at)

  //   if (this.incomingIndex === null) {
  //     return nextProps.index !== this.props.index ||
  //       nextProps.displayMode !== this.props.displayMode
  //   } else {
  //     return nextProps === null ||
  //       nextProps.index - this.props.index >= BUFFER_LENGTH ||
  //       nextProps.displayMode !== this.props.displayMode ||
  //       _stringifyBufferedItems(nextProps.items, nextProps.initialIndex) !==
  //         _stringifyBufferedItems(this.props.items, this.props.initialIndex)
  //   }
  // }

  incrementIndex () {
    this.setIndex(this.index + 1, this.bufferIndex + 1)
  }

  decrementIndex () {
    this.setIndex(this.index - 1, this.bufferIndex - 1)
  }

  setIndex (index, bufferIndex) {
    this.incomingIndex = index
    const lastIndex = this.index
    this.index = index
    this.bufferIndex = bufferIndex
    this.props.updateCurrentIndex(index, lastIndex, this.props.displayMode, this.props.isOnboarding)
  }

  render () {
    const {
      displayMode,
      isItemsOnboardingDone,
      isOnboarding,
      navigation,
      numItems,
      setPanAnim,
      toggleDisplayMode,
      items,
      index
    } = this.props

    if (numItems > 0 || isOnboarding) {
      return (
        <Fragment>
          {/*}<ToolbarsContainer navigation={this.props.navigation}/>{*/}
          <SwipeableViews
            // virtualBuffer={BUFFER_LENGTH}
            incrementIndex={this.incrementIndex}
            decrementIndex={this.decrementIndex}
            index={index === 0 ? 0 : 1}
            items={getBufferedItems(items, index)}
            // onChangeIndex={this.onChangeIndex}
            // slideCount={isOnboarding ? 2 : numItems}
            // index={index}
            isOnboarding={isOnboarding}
            // updateTimestamp={Date.now()}
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
    // // workaround for a weird bug
    // if (index % 1 !== 0) {
    //   return
    // }
    this.incomingIndex = index
    this.props.updateCurrentIndex(index, lastIndex, this.props.displayMode, this.props.isOnboarding)
  }

  // cacheCoverImageComponent
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
