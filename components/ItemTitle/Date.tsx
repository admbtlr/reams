import React from 'react'
import { Animated, TextStyle } from 'react-native'
import moment from 'moment'
import { getMargin } from '@/utils/dimensions'

interface DateProps {
  color: string
  fontSize: number
  lineHeight: number
  item: any
  date?: number
  styles: any
  showCoverImage?: boolean
  isCoverInline?: boolean
  isDarkMode?: boolean
  isVisible?: boolean
  screenWidth: number
  dateAnimation?: any
  scrollOffset: Animated.Value
  addAnimation?: (style: any, anim: any, isVisible: boolean) => any
  anims?: any
  fontFamily: string
}

const Date: React.FC<DateProps> = ({
  color,
  fontSize,
  lineHeight,
  item,
  date,
  styles,
  showCoverImage,
  isCoverInline,
  isDarkMode,
  isVisible,
  screenWidth,
  dateAnimation,
  scrollOffset,
  addAnimation,
  anims,
  fontFamily
}) => {
  if (!date && !item?.date) return null

  const theDate = date || item.date
  const momentDate = moment(theDate)
  const showYear = (momentDate.year() !== moment().year())
  const showTime = moment().unix() * 1000 - theDate < 1000 * 60 * 60 * 24 * 30
  const formattedDate = momentDate.format('MMM. D' + (showYear ? ' YYYY' : ''))
  const formattedTime = momentDate.format('h:mma')
  const showToday = momentDate.dayOfYear() === moment().dayOfYear() &&
    (momentDate.year() === moment().year())

  const dateText = `${(showToday ? 'Today' : formattedDate)}${showTime ? `, ${formattedTime}` : ''}`

  let dateStyle = {
    color,
    backgroundColor: 'transparent',
    fontSize,
    fontFamily,
    lineHeight,
    textAlign: styles?.textAlign || 'left',
    paddingLeft: getMargin() - 3,
    paddingRight: getMargin(),
    marginTop: -getMargin() / 4,
    marginBottom: getMargin() * 2,
    padding: 0,
    width: screenWidth,
    transform: []
  }

  if (anims && addAnimation) {
    dateStyle = addAnimation(dateStyle, dateAnimation, !!isVisible)
    if (!isCoverInline) {
      dateStyle.transform = dateStyle.transform || []
      dateStyle.transform.push({
        translateY: scrollOffset.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-0.25, 0, 0]
        })
      })
    }
  }

  return (
    <Animated.Text
      maxFontSizeMultiplier={1.2}
      style={dateStyle}
    >
      {dateText}
    </Animated.Text>
  )
}

export default Date
