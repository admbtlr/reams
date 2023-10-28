import React, { ReactElement } from 'react'
import {
  View,
  Dimensions,
  Text,
  Pressable
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { hslString } from '../utils/colors'
import { RootState } from '../store/reducers'
import { fontSizeMultiplier, getMargin, getStatusBarHeight } from '../utils'
import { DarkModeSetting, SET_DARK_MODE_SETTING } from '../store/ui/types'
import RadioButtons from './RadioButtons'
import { Direction, SET_ITEM_SORT } from '../store/config/types'
import { SORT_ITEMS } from '../store/items/types'
import WebView from 'react-native-webview'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'

export default function SettingsScreen () {
  const dispatch = useDispatch()
  const itemSort = useSelector((state: RootState) => state.config.itemSort)
  const darkModeSetting = useSelector((state: RootState) => state.ui.darkModeSetting)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const fontSize = useSelector((state: RootState) => state.ui.fontSize)
  const sortButtons = [
    { 
      value: Direction.desc,
      label: 'Newest first',
      icon: 'arrow-right'
     },
     { 
      value: Direction.asc,
      label: 'Oldest first',
      icon: 'arrow-left'
     },
     { 
      value: Direction.rnd,
      label: 'Random',
      icon: 'shuffle'
     },
  ]
  const darkModeButtons = [
    { 
      value: Direction.desc,
      label: 'Light',
      icon: 'sun'
     },
     { 
      value: Direction.asc,
      label: 'Dark',
      icon: 'moon'
     },
     { 
      value: Direction.rnd,
      label: 'System',
      icon: 'dark-mode'
     },
  ]
  const sortItems = (itemSort: number) => {
    dispatch({
      type: SET_ITEM_SORT,
      itemSort
    })
    dispatch({
      type: SORT_ITEMS
    })
  }
  const setDarkMode = (darkModeSetting: DarkModeSetting) => {
    dispatch({
      type: SET_DARK_MODE_SETTING,
      darkModeSetting 
    })
  }
  const setFontSize = (fontSize: number) => {
    dispatch({
      type: 'SET_FONT_SIZE',
      fontSize
    })
  }
  const SettingBlock = ({ children, title }: {children: ReactElement, title: string}) => (
    <View style={{
      backgroundColor: hslString('white'),
      borderRadius: getMargin(),
      borderColor: hslString('rizzleText'),
      borderWidth: 1,
      marginVertical: getMargin() * 0.5,
      padding: getMargin(),
      paddingTop: getMargin() * .5,
      width: '100%',
      maxWidth: 700,
    }}>
      <Text style={{
        fontFamily: 'IBMPlexSans',
        fontSize: 18 * fontSizeMultiplier(),
        textAlign: 'center',
        marginBottom: getMargin() * .5,
        color: hslString('rizzleText')
      }}>{ title }</Text>
      <View style={{
        // flex: 1,
        flexDirection: 'row',
      }}>
        { children }
      </View>
    </View>
  )
  const FontSizeBlock = ({ fontSize, isDarkMode }: {fontSize: number, isDarkMode: boolean}) => {
    const bodyColor = hslString('rizzleBG')
    let server = ''
    if (__DEV__) {
      server = 'http://localhost:8888/'
    }
    const { width, height } = Dimensions.get('window')
    const deviceWidth = height > width ? width: height
    const deviceWidthToggle = deviceWidth > 600 ? 'tablet' : 'phone'

    const html = `
    <html class="font-size-${fontSize} ${isDarkMode ? 'dark-background' : ''} ${deviceWidthToggle}">
    <head>
      <style>
    :root {
    --font-path-prefix: ${ server === '' ? '../' : server };
    --device-width: ${deviceWidth};
  }
    html, body {
      background-color: ${bodyColor};
    }
      </style>
      <link rel="stylesheet" type="text/css" href="${server}webview/css/output.css">
      <link rel="stylesheet" type="text/css" href="${server}webview/css/fonts.css">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    </head>
    <body>
      <article class="itemArticle dropCapIsDrop dropCapSize2 bodyFontSerif3">
        <p>It is too late. The Evacuation still proceeds, but it’s all theatre. There are no lights inside the cars. No light anywhere. Above him lift girders old as an iron queen, and glass somewhere far above that would let the light of day through. But it’s night. He’s afraid of the way the glass will fall—soon—it will be a spectacle: the fall of a crystal palace. But coming down in total blackout, without one glint of light, only great invisible crashing.</p>
      </article>
    </body>
    <script src="${server}webview/js/feed-item.js"></script>
    </html>
    `
    const buttonStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      width: 40 * fontSizeMultiplier(),
      height: 40 * fontSizeMultiplier(),
      borderColor: hslString('rizzleText'),
      borderWidth: 1,
      borderRadius: 20 * fontSizeMultiplier(),
    }
    return (
      <View style={{
        flex: 1,
        overflow: 'hidden',
        height: deviceWidthToggle === 'phone' ? 150 : 200,
        marginTop: getMargin() * 0.5,
        backgroundColor: hslString('white'),
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <WebView 
          originWhitelist={['*']}
          scalesPageToFit={false}
          scrollEnabled={false}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
            width: width * 1.2,
            flex: 0,
            position: 'relative',
            // left: -(width * 0.1) - fontSize * 10,
            // right: -30 - fontSize * 10,
            top: -30 - fontSize * 10 - (deviceWidthToggle === 'phone' ? 0 : 30),
            backgroundColor: hslString('rizzleBG'),
            marginBottom: getMargin()
          }}
          source={{
            html: html,
            baseUrl: 'web/'}}
        />   
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: getMargin(),
          width: '100%',
        }}>
          <Pressable
            onPress={() => fontSize > 1 && setFontSize(fontSize - 1)}
            style={buttonStyle}>
            {getRizzleButtonIcon('minus', hslString('rizzleText'))}
          </Pressable>
          <Pressable
            onPress={() => fontSize < 5 && setFontSize(fontSize + 1)}
            style={buttonStyle}>
            {getRizzleButtonIcon('plus', hslString('rizzleText'))}
          </Pressable>
        </View>
      </View> 
    )
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: hslString('rizzleBG'),
      padding: getMargin(),
      alignItems: 'center',
    }}>
      <SettingBlock 
        children={<RadioButtons data={sortButtons} selected={itemSort} onSelect={sortItems}/>}
        title='Sort articles'
      />
      <SettingBlock 
        children={<RadioButtons data={darkModeButtons} selected={darkModeSetting} onSelect={setDarkMode}/>}
        title='Dark mode'
      />
      <SettingBlock 
        children={<FontSizeBlock fontSize={fontSize} isDarkMode={isDarkMode} />}
        title='Article font size'
      />
    </View>
  )
}

const {height, width} = Dimensions.get('screen')

