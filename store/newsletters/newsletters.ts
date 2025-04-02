import {
  Newsletter, NewslettersState
} from "./types";
import { PayloadAction, createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../reducers";
import {
  addNewsletter as addNewsletterBackend,
  updateNewsletter as updateNewsletterBackend,
  deleteNewsletter as deleteNewsletterBackend,
  getNewsletters as fetchNewslettersBackend
} from "../../backends"
import { UNSET_BACKEND } from "../user/types";
import fetchNewsletterItems from "../../backends/fastmail";
import { id } from "../../utils";
import { createItemStyles } from "../../utils/createItemStyles";
import { Platform } from "react-native";
import {
  setItems as setItemsSQLite,
  deleteItems as deleteItemsSQLite
} from '../../storage/sqlite'
import {
  setItems as setItemsIDB,
  deleteItems as deleteItemsIDB
} from '../../storage/idb-storage'
import { ITEMS_BATCH_FETCHED, ItemType, MARK_ITEM_READ } from "../items/types";
import log from "../../utils/log";
import { ADD_MESSAGE, REMOVE_MESSAGE } from "../ui/types";
import { decode } from "html-entities";
import { NUDGE_FREQUENCY } from "../../components/Nudge";
import { DEACTIVATE_NUDGE, Feed, PAUSE_NUDGE } from "../feeds/types";
import { debugService } from "../../utils/debug-service";

export const createNewsletter = createAsyncThunk(
  'newsletters/createNewsletter',
  async (newsletter: { url: string }, { getState }): Promise<{ url: string }> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return newsletter
    } else {
      try {
        return await addNewsletterBackend(newsletter)
      } catch (error: any) {
        console.error(`Error adding newsletter ${newsletter.url}: ${error.message}`)
        throw error
      }
    }
  }
)

export const updateNewsletter = createAsyncThunk(
  'newsletters/updateNewsletter',
  async (newsletter: Newsletter, { getState }): Promise<Newsletter | undefined> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return newsletter
    } else {
      return await updateNewsletterBackend(newsletter)
    }
  }
)

export const deleteNewsletter = createAsyncThunk(
  'newsletters/deleteNewsletter',
  async (newsletter: Newsletter, { getState }): Promise<Newsletter> => {
    const { config } = getState() as RootState
    if (!config.isOnline) {
      // TODO add to remote action queue
      return newsletter
    } else {
      return await deleteNewsletterBackend(newsletter)
    }
  }
)

export const fetchNewsletters = createAsyncThunk(
  'newsletters/fetchNewsletters',
  async (_, { getState, dispatch }): Promise<void> => {
    dispatch({
      type: ADD_MESSAGE,
      message: {
        messageString: 'Fetching newsletters',
        hasEllipsis: true
      }
    })
    const lastQueryState = (getState() as RootState).newsletters.queryState
    const codeName = (getState() as RootState).user.codeName
    let items
    let queryState
    // let response
    try {
      const response = await fetchNewsletterItems(lastQueryState, codeName)
      items = response.items
      queryState = response.queryState
    } catch (e: any) {
      if (e.message === 'tooManyChanges') {
        // reset the query state so that we try again with a straight query next time
        dispatch(updateQueryState(undefined))
        dispatch({
          type: REMOVE_MESSAGE,
          messageString: 'Fetching newsletters'
        })
      }
      if (debugService) {
        debugService.log('Error fetching newsletters', e)
      }
      throw e
    }
    let { newsletters } = (getState() as RootState).newsletters
    // items = items.filter((item) => item.created_at > lastUpdated)
    console.log(`Got ${items.length} newsletters`)
    const newNewsletters: any = []
    items.forEach((item) => {
      if (!newsletters.find((newsletter: any) => newsletter.url === item.feed_url) &&
        !newNewsletters.find((newsletter: any) => newsletter.url === item.feed_url)) {
        newNewsletters.push({
          url: item.feed_url,
          title: decode(item.feed_title)
        })
      }
    })
    for (const newNewsletter of newNewsletters) {
      try {
        const returned = await dispatch(createNewsletter(newNewsletter)) as any
        // newsletters.push(returned.payload)
      } catch (error: any) {
        log('fetchNewsletters', error)
        // TODO: right now this just bails - maybe come up with something better?
        newNewsletters.splice(newNewsletters.indexOf(newNewsletter), 1)
      }
    }
    newsletters = (getState() as RootState).newsletters.newsletters
    if (items.length > 0) {
      try {
        items.forEach((item) => {
          item.feed_id = (getState() as RootState).newsletters.newsletters
            .find((newsletter) => newsletter.url === item.feed_url)?._id || ''
          item._id = id(item.feed_id + item.id)
          item.styles = createItemStyles(item)
        })

        if (Platform.OS === 'web') {
          await setItemsIDB(items)
        } else {
          await setItemsSQLite(items)
        }
        const { feeds: { feeds }, newsletters: { newsletters }, config: { itemSort } } = (getState() as RootState)
        dispatch({
          type: ITEMS_BATCH_FETCHED,
          itemType: ItemType.unread,
          items,
          feeds: feeds.concat(newsletters as Feed[]),
          sortDirection: itemSort
        })
      } catch (error: any) {
        log('fetchNewsletters', error)
        // TODO: right now this just bails - maybe come up with something better?
      }
    }
    dispatch(updateQueryState(queryState))
    dispatch({
      type: REMOVE_MESSAGE,
      messageString: 'Fetching newsletters'
    })
  })

const initialState: NewslettersState = {
  newsletters: [],
  updatedAt: 0,
  queryState: undefined
}

const newslettersSlice = createSlice({
  name: 'newsletters',
  initialState,
  reducers: {
    updateQueryState: (state, action: PayloadAction<string | undefined>) => {
      state.queryState = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(createNewsletter.fulfilled, (state, action) => {
      state.newsletters.push(action.payload as unknown as Newsletter)
    })
    builder.addCase(updateNewsletter.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return
      }
      let i = state.newsletters.findIndex((a: Newsletter) => a._id === action.payload?._id)
      state.newsletters[i] = action.payload
    })
    builder.addCase(deleteNewsletter.fulfilled, (state, action) => {
      let i = state.newsletters.findIndex((a: Newsletter) => a._id === action.payload._id)
      state.newsletters.splice(i, 1)
    })
    builder.addCase(UNSET_BACKEND, (state, action) => {
      state.newsletters = []
      state.updatedAt = 0
      state.queryState = undefined
    })
    builder.addCase(MARK_ITEM_READ, (state, action) => {
      const n = state.newsletters.find(n => n._id === action.item.feed_id)
      if (n) {
        n.readCount = n.readCount ?? 0
        n.readCount++
      }
    })
    builder.addCase(PAUSE_NUDGE, (state, action) => {
      const n = state.newsletters.find(n => n._id === action.sourceId)
      if (n) {
        n.nextNudge = (n.readCount ?? 0) + NUDGE_FREQUENCY
      }
    })
    builder.addCase(DEACTIVATE_NUDGE, (state, action) => {
      const n = state.newsletters.find(n => n._id === action.sourceId)
      if (n) {
        n.isNudgeActive = false
      }
    })
  }
})

// Extract the action creators object and the reducer
export const { actions, reducer } = newslettersSlice
export const { deactivateNudge, pauseNudge, updateQueryState } = actions
// Export the reducer, either as a default or named export
const newsletters = newslettersSlice.reducer
export default newsletters

export const selectNewsletters = (state: RootState) => state.newsletters.newsletters
