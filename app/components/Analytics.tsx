import {useEffect} from 'react'
import { AppState } from 'react-native'
import Forage from 'react-native-forage'
import { useSelector } from 'react-redux'

const FORAGE_APP_KEY = '6a074ead-e3b0-4424-99ad-0274782b53d8'
interface AnalyticsProps {}
interface feed {
  title: string
  url: string
}

let prevFeeds: feed[]

const Analytics: React.FC<AnalyticsProps> = ({}) => {
  useEffect(() => {
    Forage.start(FORAGE_APP_KEY, AppState)
  }, [])

  const feeds = useSelector(state => state.feeds.feeds)

  if (!!prevFeeds) {
    feeds.forEach(f => {
      if (!prevFeeds.find(pf => pf.url === f.url)) {
        console.log('trackEvent: Add Feed')
        Forage.trackEvent('Add Feed', {
          title: f.title,
          url: f.url
        })
      }
    })  
  }
  prevFeeds = feeds.map((f:feed) => ({
    title: f.title,
    url: f.url
  }))

  return null
}

export default Analytics
