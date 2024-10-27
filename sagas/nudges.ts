import { call, put, select } from 'redux-saga/effects'
import { getFeeds } from './selectors'
import { RootState } from '../store/reducers'
import { deactivateNudgeFeed, deactivateNudgeNewsletter, pauseNudgeFeed, pauseNudgeNewsletter } from '../storage/supabase'
import { Newsletter } from '../store/newsletters/types'
import { deactivateNudgeAction, Feed, pauseNudgeAction } from '../store/feeds/types'

export function * pauseNudge(action: pauseNudgeAction) {
  const feed: Feed = yield select((state: RootState) => state
    .feeds.feeds.find(f => f._id === action.sourceId))
  if (feed) {
    yield call(pauseNudgeFeed, feed)
  } else {
    const newsletter: Newsletter = yield select((state: RootState) => state
      .newsletters.newsletters.find(f => f._id === action.sourceId))
    if (newsletter) {
      yield call(pauseNudgeNewsletter, newsletter)
    }
  }
}

export function * deactivateNudge(action: deactivateNudgeAction) {
  const feed: Feed = yield select((state: RootState) => state
    .feeds.feeds.find(f => f._id === action.sourceId))
  if (feed) {
    yield call(deactivateNudgeFeed, feed)
  } else {
    const newsletter: Newsletter = yield select((state: RootState) => state
      .newsletters.newsletters.find(f => f._id === action.sourceId))
    if (newsletter) {
      yield call(deactivateNudgeNewsletter, newsletter)
    }
  }
}

