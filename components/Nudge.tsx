import React, { useEffect, useState } from 'react'
import { Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { fontSizeMultiplier, getMargin, getStatusBarHeight } from '../utils/dimensions'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { useColor } from '../hooks/useColor'
import { textInfoBoldItalicStyle, textInfoBoldStyle, textInfoItalicStyle, textInfoMonoItalicStyle, textInfoStyle } from '../utils/styles'
import { DEACTIVATE_NUDGE, Feed, PAUSE_NUDGE } from '../store/feeds/types'
import launchBrowser from '../utils/launch-browser'
import { animateNextLayout } from '../utils/layout-animations'
import { getHost } from '@/utils'
const entities = require('entities')

export const NUDGE_FREQUENCY = 10

// Set a default value but don't calculate at module load time
export let nudgeHeight = 100

export default function Nudge({ feed_id, scrollAnim }: {
  feed_id: string
  scrollAnim: any
}) {
  // Use useState to keep track of the height locally
  const [height, setHeight] = useState(nudgeHeight)

  // Calculate the height when the component mounts
  useEffect(() => {
    const calculatedHeight = getMargin() * 3 + (24 * fontSizeMultiplier() * 2) + (32 * fontSizeMultiplier())
    nudgeHeight = calculatedHeight // Update the exported value
    setHeight(calculatedHeight)
  }, [])
  const feed = useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === feed_id) ??
    state.newsletters.newsletters.find(n => n._id === feed_id))

  // do we already have the color?
  const host = getHost(null, feed)
  const cachedColor = useSelector((state: RootState) => state.hostColors.hostColors.find(hc => hc.host === host)?.color)
  const hookColor = useColor(host, cachedColor === undefined)
  const color = hookColor || cachedColor

  const dispatch = useDispatch()

  if (!(feed?.readCount && feed?.nextNudge &&
    feed?.readCount > 0 &&
    feed?.nextNudge <= feed?.readCount &&
    feed?.isNudgeActive &&
    feed?.subscribeUrl
  )) {
    return null
  }

  const touchableOpacityStyle = {
    paddingHorizontal: getMargin(),
    paddingVertical: getMargin() / 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: getMargin(),
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    opacity: 0.9
  }

  const suffix = feed?.readCount % 10 === 1 && feed?.readCount % 100 !== 11 ? 'st' :
    feed?.readCount % 10 === 2 && feed?.readCount % 100 !== 12 ? 'nd' :
      feed?.readCount % 10 === 3 && feed?.readCount % 100 !== 13 ? 'rd' :
        'th'

  return (
    <View style={{ zIndex: 100 }}>
      <View style={{
        height: height,
        width: '100%'
      }} />
      <Animated.View style={{
        position: 'absolute',
        left: 0,
        top: getStatusBarHeight(),
        height: height,
        width: '100%',
        paddingTop: getMargin(),
        backgroundColor: color,
        transform: [
          {
            translateY: scrollAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-1, 0, 0]
            })
          }
        ]
      }}>
        <View style={{
          flex: 1,
          justifyContent: 'space-between',
          height: '100%',
          // backgroundColor: 'yellow',
        }}>
          <Text style={{
            ...textInfoBoldStyle('hsl(0, 0%, 100%)', 0),
            flex: 0,
            paddingHorizontal: getMargin(),
            opacity: 1
          }}>This is the {feed?.readCount + suffix} article you’ve read from <Text style={textInfoBoldItalicStyle('hsl(0, 0%, 100%)', 0)}>{entities.decodeHTML(feed?.title || '')}</Text>. How about supporting them?</Text>
          <View style={{
            flex: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: getMargin()
          }}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  animateNextLayout()
                  dispatch({ type: DEACTIVATE_NUDGE, sourceId: feed._id })
                }}
                style={touchableOpacityStyle}
              >
                <Text style={{
                  ...textInfoBoldStyle('hsl(0, 0%, 0%)', 0, true),
                }}>Already done</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  dispatch({ type: PAUSE_NUDGE, sourceId: feed._id })
                }}
                style={touchableOpacityStyle}
              >
                <Text style={{
                  ...textInfoBoldStyle('hsl(0, 0%, 0%)', 0, true),
                }}>Maybe later</Text>
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                style={touchableOpacityStyle}
                onPress={() => feed?.subscribeUrl && feed?.subscribeUrl !== undefined && launchBrowser(feed?.subscribeUrl)}
              >
                <Text style={{
                  ...textInfoBoldStyle('hsl(0, 0%, 0%)', 0, true),
                }}>Show me</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </Animated.View>
    </View>

  )
}
