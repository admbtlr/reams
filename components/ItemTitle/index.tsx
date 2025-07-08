import React from 'react'
import { Animated, Dimensions, View, ViewStyle, Platform } from 'react-native'
import Reanimated from 'react-native-reanimated'
import { useSelector, useDispatch } from 'react-redux'
import { ItemType, SET_TITLE_FONT_SIZE } from '@/store/items/types'
import { getMargin, isIpad, isPortrait } from '@/utils/dimensions'
import { getTopBarHeight } from '@/components/ItemCarousel/TopBar'
import CategoryToggles from '@/components/CategoryToggles'
import { withUseColorHOC } from '@/components/withUseColorHOC'
import Title from './Title'
import Excerpt from './Excerpt'
import Author from './Author'
import Date from './Date'
import Bar from './Bar'
import { useAnimationValues } from '../ItemCarousel/AnimationContext'
import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

interface FontStyle {
  fontFamily: string
}

interface FontWeight {
  bold: FontStyle
  boldItalic: FontStyle
  regular: FontStyle
  regularItalic: FontStyle
}

interface FontStyles {
  [key: string]: FontWeight
}

interface ItemTitleProps {
  backgroundColor?: string
  isCoverInline?: boolean
  isVisible?: boolean
  item: any
  itemIndex: number
  scrollOffset: Animated.Value
  showCoverImage?: boolean
  anims?: any
  addAnimation?: (style: any, anim: any, isVisible: boolean) => any
  excerpt?: string
  color?: string
  styles?: any
  title?: string
  coverImageStyles?: any
  fontSize?: number
  font?: string
  layoutListener?: (height: number) => void
}

interface RootState {
  ui: {
    isDarkMode: boolean
  }
  itemsMeta: {
    display: string
  }
}

interface AnimationValues {
  opacity: Animated.Value
  titleAnimation: any
  categoriesAnimation: any
  excerptAnimation: any
  authorAnimation: any
  dateAnimation: any
  barAnimation: any
}

const fontStyles: FontStyles = {
  headerFontSerif1: {
    bold: {
      fontFamily: 'PlayfairDisplay-Bold'
    },
    boldItalic: {
      fontFamily: 'PlayfairDisplay-BoldItalic'
    },
    regular: {
      fontFamily: 'PlayfairDisplay-Regular'
    },
    regularItalic: {
      fontFamily: 'PlayfairDisplay-Italic'
    }
  },
  headerFontSerif2: {
    bold: {
      fontFamily: 'IBMPlexSerif-Bold'
    },
    boldItalic: {
      fontFamily: 'IBMPlexSerif-BoldItalic'
    },
    regular: {
      fontFamily: 'IBMPlexSerif-Light'
    },
    regularItalic: {
      fontFamily: 'IBMPlexSerif-LightItalic'
    }
  },
  headerFontSerif3: {
    bold: {
      fontFamily: 'PlayfairDisplay-Black'
    },
    boldItalic: {
      fontFamily: 'PlayfairDisplay-BlackItalic'
    },
    regular: {
      fontFamily: 'PlayfairDisplay-Regular'
    },
    regularItalic: {
      fontFamily: 'PlayfairDisplay-Italic'
    }
  },
  headerFontSerif4: {
    bold: {
      fontFamily: 'Reforma1969-Negra'
    },
    boldItalic: {
      fontFamily: 'Reforma1969-NegraItalica'
    },
    regular: {
      fontFamily: 'Reforma1969-Blanca'
    },
    regularItalic: {
      fontFamily: 'Reforma1969-BlancaItalica'
    }
  },
  headerFontSans1: {
    bold: {
      fontFamily: Platform.OS === 'ios' ? 'AvenirNextCondensed-Bold' : 'NunitoSans-Bold'
    },
    boldItalic: {
      fontFamily: Platform.OS === 'ios' ? 'AvenirNextCondensed-BoldItalic' : 'NunitoSans-BoldItalic'
    },
    regular: {
      fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'NunitoSans-Regular'
    },
    regularItalic: {
      fontFamily: Platform.OS === 'ios' ? 'AvenirNext-MediumItalic' : 'NunitoSans-Italic'
    }
  },
  headerFontSans2: {
    bold: {
      fontFamily: 'Poppins-ExtraBold'
    },
    boldItalic: {
      fontFamily: 'Poppins-ExtraBoldItalic'
    },
    regular: {
      fontFamily: 'Poppins-Regular'
    },
    regularItalic: {
      fontFamily: 'Poppins-Italic'
    }
  },
  headerFontSans3: {
    bold: {
      fontFamily: 'Montserrat-Bold'
    },
    boldItalic: {
      fontFamily: 'Montserrat-BoldItalic'
    },
    regular: {
      fontFamily: 'Montserrat-Regular'
    },
    regularItalic: {
      fontFamily: 'Montserrat-Italic'
    }
  },
  headerFontSans4: {
    bold: {
      fontFamily: 'Reforma2018-Negra'
    },
    boldItalic: {
      fontFamily: 'Reforma2018-NegraItalica'
    },
    regular: {
      fontFamily: 'Reforma2018-Blanca'
    },
    regularItalic: {
      fontFamily: 'Reforma2018-BlancaItalica'
    }
  }
}

const ItemTitle: React.FC<ItemTitleProps> = (props) => {
  const dispatch = useDispatch()
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const displayMode = useSelector((state: RootState) => state.itemsMeta.display)

  const {
    backgroundColor,
    isCoverInline,
    isVisible,
    item,
    itemIndex,
    scrollOffset,
    showCoverImage,
    anims,
    addAnimation,
    excerpt,
    color
  } = props

  // Extract styles and title from props/item
  const styles = props.styles || (item?.styles?.title)
  const title = props.title || item?.title
  const isPortraitOrientation = isPortrait()

  // Font family calculation function
  const getFontFamily = (fontType?: string, fontVariant?: string) => {
    const font = item?.styles?.fontClasses.heading
    let fontFamily = font

    switch (fontVariant) {
      case 'alternate':
        fontFamily = font.indexOf('Serif') !== -1 ?
          font.replace('Serif', 'Sans') :
          font.replace('Sans', 'Serif')
        break
      case 'excerpt':
        if (fontFamily === 'headerFontSans2') {
          fontFamily = 'headerFontSans1'
        } else if (fontFamily === 'headerFontSerif1') {
          fontFamily = 'headerFontSerif2'
        }
        break
      case 'author':
        if (fontFamily === 'headerFontSans2') {
          fontFamily = 'headerFontSans1'
        }
    }

    if (fontType) {

    } else if (styles.isBold && styles.isItalic) {
      fontType = 'boldItalic'
    } else if (styles.isBold || item.showCoverImage) {
      fontType = 'bold'
    } else if (styles.isItalic) {
      fontType = 'regularItalic'
    } else {
      fontType = 'regular'
    }

    return fontStyles[fontFamily][fontType].fontFamily
  }

  // Calculate font families for each component
  const titleFontFamily: string = getFontFamily()
  const excerptFontFamily: string = getFontFamily(
    isCoverInline ||
      item.styles?.coverImage?.resizeMode === 'contain' ||
      !showCoverImage ? 'regular' : 'boldItalic',
    'excerpt'
  )
  const authorFontFamily: string = getFontFamily('bold', 'author')
  const dateFontFamily: string = getFontFamily('regular', 'author')

  // Early return if not ready
  if (!styles || !item) return null

  const textColor = 'hsl(0, 0%, 20%)'
  const textColorDarkMode = 'hsl(0, 0%, 70%)'

  const window = Dimensions.get('window')
  const screenWidth: number = window.width
  const screenHeight: number = window.height

  const isFullBleed: boolean = !!(showCoverImage && !isCoverInline)

  const { verticalScrolls } = useAnimationValues()
  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: isCoverInline || !showCoverImage || !isVisible ?
      1 :
      interpolate(verticalScrolls[itemIndex].value, [-100, -10, 0, 100, 200], [0, 1, 1, 1, 0])
  }))

  // Helper function for animation values (extracted from original)
  const getAnimationValues = (): AnimationValues => {
    if (!anims) return {
      opacity: new Animated.Value(1),
      titleAnimation: {},
      categoriesAnimation: {},
      excerptAnimation: {},
      authorAnimation: {},
      dateAnimation: {},
      barAnimation: {}
    }

    const opacity = new Animated.Value(isVisible ? 1 : 0)
    const titleAnimation = anims.title || {}
    const categoriesAnimation = anims.categories || {}
    const excerptAnimation = anims.excerpt || {}
    const authorAnimation = anims.author || {}
    const dateAnimation = anims.date || {}
    const barAnimation = anims.bar || {}

    return {
      opacity,
      titleAnimation,
      categoriesAnimation,
      excerptAnimation,
      authorAnimation,
      dateAnimation,
      barAnimation
    }
  }

  // Animation values
  const {
    opacity = new Animated.Value(1),
    titleAnimation = {},
    categoriesAnimation = {},
    excerptAnimation = {},
    authorAnimation = {},
    dateAnimation = {},
    barAnimation = {}
  } = anims ? getAnimationValues() : {}

  const getOverlayColor = () => {
    if (!showCoverImage ||
      item.styles?.coverImage?.resizeMode === 'contain') {
      return 'transparent'
    } else if (item.styles?.coverImage?.resizeMode === 'contain' && !item.styles?.coverImage?.isMultiply) {
      return 'rgba(255,255,255,0.2)'
    } else if (!styles.isMonochrome) {
      return 'rgba(240, 240, 240, 0.6)'
    } else if (item.styles?.coverImage?.isBW ||
      item.styles?.coverImage?.isMultiply ||
      item.styles?.coverImage?.isScreen) {
      return 'rgba(0,0,0,0.4)'
    } else if (item.styles.title.bg) {
      return 'rgba(0,0,0,0.4)'
    } else {
      return 'rgba(0,0,0,0.6)'
    }
  }

  // Outer view style calculations
  const outerViewStyle: ViewStyle = {
    width: screenWidth,
    height: !isFullBleed ? 'auto' :
      isPortraitOrientation || isIpad() ? screenHeight * 1.2 : screenHeight * 1.4,
    paddingTop: showCoverImage && isCoverInline ?
      0 :
      showCoverImage ?
        getTopBarHeight() + screenHeight * 0.2 :
        getTopBarHeight(),
    paddingHorizontal: isPortraitOrientation ? 0 :
      isIpad() ? getMargin() : getMargin() * 2,
    paddingBottom: isCoverInline || !showCoverImage ?
      0 :
      isPortraitOrientation || isIpad() ? 100 : 0,
    marginTop: 0,
    marginBottom: !showCoverImage || isCoverInline ? 0 : -screenHeight * 0.2,
    top: !showCoverImage || isCoverInline ? 0 : -screenHeight * 0.2,
    left: 0,
    flexDirection: 'column',
    backgroundColor: !showCoverImage || isCoverInline ?
      (styles.bg ? color || 'black' : 'transparent') :
      getOverlayColor()
  }

  // Layout justifiers and aligners
  const justifiers = {
    'top': 'flex-start',
    'middle': 'center',
    'bottom': 'flex-end',
    'top-bottom': 'space-between'
  }

  const aligners = {
    'left': 'flex-start',
    'center': 'center'
  }

  // Check if should show excerpt
  const shouldShowExcerpt = () =>
    item.excerpt !== null &&
    item.excerpt !== undefined &&
    item.excerpt.length > 0 &&
    !item.excerpt.includes('ellip') &&
    !item.excerpt.includes('…')

  const itemStartsWithImage = () => {
    // Simplified version of original logic
    return item.content_html &&
      item.content_html.trim().startsWith('<img')
  }

  const getExcerptColor = () => {
    let excerptColor
    if (!styles.bg && (!showCoverImage || isCoverInline || item.styles?.coverImage?.isContain)) {
      excerptColor = isDarkMode ? textColorDarkMode : textColor
      // } else if (styles.bg) {
      //   excerptColor = 'black'
    } else if (showCoverImage && styles.isExcerptTone) {
      excerptColor = styles.isCoverImageColorDarker ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
    } else {
      excerptColor = 'white'
    }
    return excerptColor
  }

  const getExcerptFontSize = () => {
    return Math.round(getExcerptLineHeight() / 1.4)
  }

  const getExcerptLineHeight = () => {
    let excerptLineHeight = Math.round(Math.min(screenHeight, screenWidth) / 16)
    if (excerptLineHeight > 32) excerptLineHeight = 32
    return excerptLineHeight// * fontSizeMultiplier()
  }

  // for the author, date, tags
  const getMetaColor = () => {
    return styles.bg || (showCoverImage && !isCoverInline) ?
      'white' :
      isDarkMode ?
        textColorDarkMode :
        color || getExcerptColor()
  }

  // Layout event handler
  const onLayout = (height: number) => {
    if (props.layoutListener) {
      props.layoutListener(height)
    }
  }

  return (
    <Reanimated.View
      onLayout={event => onLayout(
        event.nativeEvent.layout.height + event.nativeEvent.layout.y
      )}
      pointerEvents='box-none'
      style={[{
        ...outerViewStyle,
        justifyContent: showCoverImage ? (justifiers[styles.valign] || 'flex-start') : 'flex-start',
        alignItems: styles.textAlign === 'center' ? 'center' : 'flex-start',
        flex: showCoverImage && !isCoverInline ? 0 : 1
      }, animatedOpacity]}
    >
      <Title
        title={title}
        item={item}
        styles={styles}
        showCoverImage={showCoverImage}
        isCoverInline={isCoverInline}
        isDarkMode={isDarkMode}
        isVisible={isVisible || false}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        isFullBleed={isFullBleed}
        titleAnimation={titleAnimation}
        scrollOffset={scrollOffset}
        addAnimation={addAnimation}
        anims={anims}
        justifiers={justifiers}
        aligners={aligners}
        fontFamily={titleFontFamily}
        getFontFamily={getFontFamily}
      />

      {shouldShowExcerpt() && excerpt && (
        <Excerpt
          color={getExcerptColor()}
          fontSize={getExcerptFontSize()}
          lineHeight={getExcerptFontSize() * 1.4}
          excerpt={excerpt}
          item={item}
          styles={styles}
          showCoverImage={showCoverImage}
          isCoverInline={isCoverInline}
          isDarkMode={isDarkMode}
          isVisible={isVisible || false}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          isFullBleed={isFullBleed}
          excerptAnimation={excerptAnimation}
          scrollOffset={scrollOffset}
          addAnimation={addAnimation}
          anims={anims}
          justifiers={justifiers}
          aligners={aligners}
          fontFamily={excerptFontFamily}
        />
      )}

      <View style={{
        flex: 0,
        marginTop: shouldShowExcerpt() ? 0 : getMargin()
      }}>
        <Author
          {...props}
          color={getMetaColor()}
          fontSize={getExcerptFontSize()}
          lineHeight={getExcerptFontSize() * 1.1}
          styles={styles}
          isDarkMode={isDarkMode}
          screenWidth={screenWidth}
          authorAnimation={authorAnimation}
          scrollOffset={scrollOffset}
          addAnimation={addAnimation}
          isVisible={isVisible}
          fontFamily={authorFontFamily}
        />

        <Date
          {...props}
          color={getMetaColor()}
          fontSize={getExcerptFontSize() * 0.8}
          lineHeight={getExcerptFontSize()}
          styles={styles}
          isDarkMode={isDarkMode}
          screenWidth={screenWidth}
          dateAnimation={dateAnimation}
          scrollOffset={scrollOffset}
          addAnimation={addAnimation}
          isVisible={isVisible}
          fontFamily={dateFontFamily}
        />
      </View>

      {displayMode === ItemType.saved && (
        <Animated.View style={{
          ...(addAnimation ? addAnimation({
            transform: [{
              translateY: scrollOffset.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [0, 0, 0]
              })
            }]
          }, categoriesAnimation, isVisible || false) : {}),
          marginBottom: getMargin(),
          marginLeft: getMargin() * 0.8,
        }}>
          <CategoryToggles
            isWhite={isFullBleed || styles.bg}
            item={item}
          />
        </Animated.View>
      )}

      {((!showCoverImage && itemStartsWithImage()) ||
        (showCoverImage && item.excerpt !== null && item.excerpt !== undefined &&
          item.excerpt.length > 0 && styles.excerptInvertBG) ||
        (showCoverImage && item.styles?.coverImage?.resizeMode === 'contain') ||
        (showCoverImage && !isPortraitOrientation) ||
        (!isFullBleed && styles.bg)) && (
          <Bar
            item={item}
            styles={styles}
            barAnimation={barAnimation}
            addAnimation={addAnimation}
            isVisible={isVisible || false}
            anims={anims}
          />
        )}
    </Reanimated.View>
  )
}

export default withUseColorHOC(ItemTitle)
