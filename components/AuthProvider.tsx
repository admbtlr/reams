import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Linking, Platform } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { SET_PREMIUM, SET_USER_DETAILS, UNSET_BACKEND } from "../store/user/types"
import { supabase } from "../storage/supabase"
import { startDownloads } from "../store/config/types"
import { Item } from "../store/items/types"
import { RootState } from "../store/reducers"
import { persistor } from "./Rizzle"
import { getCodeName } from "../storage/supabase/user"
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { deleteAllItems } from "@/storage"

interface SessionContext {
  session?: Session | null,
  error?: string
}

export const SessionContext = createContext<SessionContext>({})

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = (props: any) => {
  const [session, setSession] = useState<SessionContext>({})
  const [isRevenueCatConfigured, setIsRevenueCatConfigured] = useState(false)
  const dispatch = useDispatch()
  let lastSessionChange = 0

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!!session) {
          if (Date.now() - lastSessionChange < 10000) {
            console.log('Date.now() - lastSessionChange < 10000')
            console.log(`lastSessionChange: ${lastSessionChange}`)
            return
          }
          lastSessionChange = Date.now()
          setSession({ session })
          // https://supabase.com/docs/reference/javascript/auth-onauthstatechange
          setTimeout(async () => {
            const codeName = await getCodeName()
            const userDetails = {
              ...session.user,
              codeName
            }
            dispatch({ type: SET_USER_DETAILS, details: userDetails })
            dispatch(startDownloads())
          }, 0)
        } else {
          setSession({ session: null })
          dispatch({ type: UNSET_BACKEND, backend: 'reams' })
          setTimeout(async () => {
            // @ts-ignore
            if (persistor !== undefined) {
              await persistor.purge()
            }
            deleteAllItems()
          }, 0)
        }
      }
    )
    return () => {
      authListener!.subscription.unsubscribe()
    }
  }, [])

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
          setSession({ error: errorMessage[1].replace(/\+/g, ' ') })
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

  useEffect(() => {
    const configureRevenueCat = async () => {
      await Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '',
        appUserID: session.session?.user.id
      })
      console.log('RevenueCat API Key: ' + process.env.EXPO_PUBLIC_REVENUECAT_API_KEY)
      const appUserId = await Purchases.getAppUserID()
      console.log('RevCat appUserId: ' + appUserId)
      try {
        const customerInfo = await Purchases.getCustomerInfo()
        if ((session.session && isUserTrial(session.session)) ||
          typeof customerInfo.entitlements.active["premium"] !== "undefined") {
          dispatch({ type: SET_PREMIUM, isPremium: true })
        } else {
          dispatch({ type: SET_PREMIUM, isPremium: false })
        }
      } catch (e) {
        console.error('Error getting offerings', e)
        // debugger
      }
      setIsRevenueCatConfigured(true)
    }

    const isUserTrial = (session: Session) => {
      if (session.user.created_at) {
        const now = new Date()
        const created = new Date(session.user.created_at)
        const diff = now.getTime() - created.getTime()
        const days = diff / (1000 * 60 * 60 * 24)
        return days < 30
      }
    }

    if (session.session?.user.id && !isRevenueCatConfigured) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)
      if (Platform.OS === 'ios') {
        configureRevenueCat()
      }
    }
  }, [session?.session?.user.id])

  return <SessionContext.Provider value={session} {...props} />

}
