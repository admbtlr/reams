import { InteractionManager } from 'react-native'
import { call, put, select } from 'redux-saga/effects'

import { ADD_readingTime } from '../store/items/types'
import { getCurrentItem, getDisplay } from './selectors'

import log from '../utils/log'

let startTime
let accumulatedTime = 0
let currentItem
let itemsScreenActive = false

export function * currentItemChanged (action) {
  yield call(InteractionManager.runAfterInteractions)
  const display = yield select(getDisplay)
  if (display !== 'unread') return
  const prevItem = currentItem
  if (itemsScreenActive) {
    if (startTime && prevItem) {
      yield * logReadingTime(prevItem)
      resetTimer()
    }
    yield startTimer()
  }
}

// called by the navigation when user goes to a non-items screen
export function * screenInactive () {
  // console.log('STOP TIMING - ' + (currentItem && currentItem.title))
  if (currentItem) {
    yield logReadingTime(currentItem)
    resetTimer()
  }
  itemsScreenActive = false
}

// called by the navigation when user goes to the items screen
export function * screenActive () {
  yield startTimer()
  itemsScreenActive = true
}

export function * appActive () {
  if (itemsScreenActive) {
    yield startTimer()
  }
}

export function * appInactive () {
  if (itemsScreenActive && currentItem) {
    yield logReadingTime(currentItem)
    resetTimer()
  }
}

function * logReadingTime (item) {
  const now = Date.now()
  const readingTime = Math.round((now - startTime + accumulatedTime) / 1000)
  yield call(InteractionManager.runAfterInteractions)
  yield put ({
    type: ADD_readingTime,
    item: item,
    readingTime
  })
  // console.log('LOG READING TIME: ' + readingTime + 'sec for ' + item.title)
}

function * startTimer (item) {
  currentItem = yield select(getCurrentItem)
  startTime = Date.now()
  // console.log('START TIMING - ' + (currentItem && currentItem.title))
}

function resetTimer () {
  startTime = undefined
  accumulatedTime = 0
  currentItem = undefined
}

