import {useEffect, useState} from 'react'
import { AppState, Platform } from 'react-native'
import { Mixpanel } from 'mixpanel-react-native'
import { useSelector } from 'react-redux'
import { RootState } from 'store/reducers'

const FORAGE_APP_KEY = '6a074ead-e3b0-4424-99ad-0274782b53d8'
const MIXPANEL_TOKEN = '11b2c9932594da18e9593b507cdc557d'
interface AnalyticsProps {}
interface feed {
  title: string
  url: string
}

let prevFeeds: feed[]

const Analytics: React.FC<AnalyticsProps> = ({}) => {
  const userId = useSelector((state: RootState) => state.user.userId)
  const isRehydrated = useSelector((state: RootState) => state._persist?.rehydrated)

  useEffect(() => {
    const trackAutomaticEvents = true
    const useNative = Platform.OS !== 'web'
    const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents, useNative)
    if (isRehydrated && userId) {
      mixpanel.init()
      mixpanel.identify(userId)
    }
  }, [isRehydrated])

  // const feeds = useSelector(state => state.feeds.feeds)
  // const isRehydrated = useSelector(state => state._persist?.rehydrated)
  // const [rehydrated, setRehydrated] = useState(false)

  // if (rehydrated && !!prevFeeds) {
  //   feeds.forEach(f => {
  //     if (!prevFeeds.find(pf => pf.url === f.url)) {
  //       console.log('trackEvent: Add Feed')
  //       Forage.trackEvent('Add Feed', {
  //         title: f.title,
  //         url: f.url
  //       })
  //     }
  //   })  
  // }
  // prevFeeds = feeds.map((f:feed) => ({
  //   title: f.title,
  //   url: f.url
  // }))
  // if (isRehydrated !== rehydrated) {
  //   setRehydrated(isRehydrated)
  // }

  return null
}

export default Analytics
