import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Linking } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { SET_USER_DETAILS, UNSET_BACKEND } from "../store/user/types"
import { supabase } from "../storage/supabase"
import { startDownloads } from "../store/config/types"
import { Item } from "../store/items/types"
import { RootState } from "../store/reducers"
import { persistor } from "../store"
import { getCodeName } from "../storage/supabase/user"

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
  const dispatch = useDispatch()
  let lastSessionChange = 0

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!!session) {
          if (Date.now() - lastSessionChange < 10000) {
            return
          }
          lastSessionChange = Date.now()
          setSession({session})
          const codeName = await getCodeName()
          const userDetails = {
            ...session.user,
            codeName
          }
          dispatch({ type: SET_USER_DETAILS, details: userDetails })
          dispatch(startDownloads())
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