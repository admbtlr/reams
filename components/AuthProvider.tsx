import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Linking, Platform } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { SET_USER_DETAILS, UNSET_BACKEND } from "../store/user/types"
import { supabase } from "../storage/supabase"
import { fetchAnnotations } from "../store/annotations/annotations"
import { START_DOWNLOADS } from "../store/config/types"
import { fetchCategories } from "../store/categories/categoriesSlice"
import fetchNewsletterItems from "../backends/fastmail"
import { ITEMS_BATCH_FETCHED, Item, ItemType } from "../store/items/types"
import { RootState } from "../store/reducers"
import { createNewsletter, fetchNewsletters, updateQueryState } from "../store/newsletters/newsletters"
import { id, sleep } from "../utils"
import { cleanUpItems } from "../sagas/fetch-items"
import { createItemStyles } from "../utils/createItemStyles"
import { persistor } from "../store"

interface SessionContext {
  session?: Session | null,
  error?: string
}

export const SessionContext = createContext<SessionContext>({})

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error(`useSession must be used within an AuthProvider.`);
  }
  return context;
}

export const AuthProvider = (props: any) => {
  const [session, setSession] = useState<SessionContext>({})
  const [newsletterItems, setNewsletterItems] = useState<Item[]>([])
  const dispatch = useDispatch()
  const newsletters = useSelector((state: RootState) => state.newsletters.newsletters)
  const lastQueryState = useSelector((state: RootState) => state.newsletters.queryState)
  const feeds = useSelector((state: RootState) => state.feeds.feeds)
  const sortDirection = useSelector((state: RootState) => state.config.itemSort)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!!session) {
          console.log('Auth event', event)
          setSession({session})
          dispatch({ type: SET_USER_DETAILS, details: session.user })
          // initial fetches can go here
          // await sleep(5000)
          await dispatch(fetchAnnotations())
          await dispatch(fetchCategories())
          await dispatch(fetchNewsletters())
          dispatch({ type: START_DOWNLOADS })
        } else {
          setSession({session: null})
          dispatch({ type: UNSET_BACKEND, backend: 'reams' })
          // @ts-ignore
          await persistor.purge()
        }
      }
    )
    return () => {
      authListener!.subscription.unsubscribe()
    }
  }, [])

  // useEffect(() => {
  //   if (newsletterItems.length === 0) return
  //   // this might be dodgy
  //   if (feeds.length === 0 && newsletters.length === 0) return

  //   const saveNewsletterItems = async (items: Item[]) => {
  //     if (Platform.OS === 'web') {
  //       await setItemsIDB(items)
  //     } else {
  //       await setItemsSQLite(items)
  //     }        
  //     dispatch({
  //       type: ITEMS_BATCH_FETCHED,
  //       itemType: ItemType.unread,
  //       items,
  //       feeds: feeds.concat(newsletters),
  //       sortDirection
  //     })
  //     setNewsletterItems([])
  //   }
  
  //   saveNewsletterItems(newsletterItems)
  // }, [newsletterItems, feeds])

  useEffect(() => {
    const supabaseLogin = async (url: string) => {
      if (url.match(/access_token=([^&]+)/) !== null && url.match(/refresh_token=([^&]+)/) !== null) {
        const accessMatch = url.match(/access_token=([^&]+)/)
        const refreshMatch = url.match(/refresh_token=([^&]+)/)
        const accessToken = accessMatch !== null && accessMatch.length > 1 ? accessMatch[1] : ''
        const refreshToken = refreshMatch !== null && refreshMatch.length > 1 ? refreshMatch[1] : ''
        const session = await supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
        console.log('Session is', session)
      }
    }
    const getLinkUrl = async () => {
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl !== null) {
        checkUrlAndDoLogin(initialUrl)
      }
    }
    Linking.addEventListener('url', ({ url }) => {
      checkUrlAndDoLogin(url)
    })
    const checkUrlAndDoLogin = async (url: string | null) => {
      console.log('URL is', url)
      if (url === null) return
      if (url.indexOf('error') !== -1) {
        let errorMessage = url?.match(/error_description=([^&]+)/)
        if (errorMessage !== null) {
          setSession({error: errorMessage[1].replace(/\+/g, ' ')})
        }
        return
      }
      supabaseLogin(url)
    }
    getLinkUrl()
    return () => {
      if (Linking !== undefined) Linking.removeAllListeners('url')
    } 
  }, [])

  return <SessionContext.Provider value={session} {...props} />

}