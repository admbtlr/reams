import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { startDownloads } from './config/types'
import { fetchAnnotations } from './annotations/annotations'
import { fetchCategories } from './categories/categoriesSlice'
import { fetchNewsletters } from './newsletters/newsletters'
import { fetchAllFeeds } from '../sagas/feeds'

export const downloadsListenerMiddleware = createListenerMiddleware()
downloadsListenerMiddleware.startListening({
  actionCreator: startDownloads,
  effect: async (action, listenerApi) => {
    console.log('Listener caught the startDownloads action')
    listenerApi.dispatch(fetchAnnotations())
    listenerApi.dispatch(fetchCategories())
    listenerApi.dispatch(fetchNewsletters())
  }

})
