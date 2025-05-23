import { useNavigation } from '@react-navigation/native'
import { RootState } from '../store/reducers'
import { hslString } from '../utils/colors'
import { fontSizeMultiplier } from '../utils/dimensions'
import { useSelector } from 'react-redux'
import { Platform } from 'react-native'
import { useLayoutEffect } from 'react'
import { headerOptions } from '../components/App'

/**
 * A hook to dynamically update the navigation header style based on dark mode
 * @param options Optional configuration object
 * @param options.bgVariant Optional string specifying a background color variant ('darker', etc.)
 * @param options.bgColor Optional string specifying a custom background color key to use instead of 'rizzleBG'
 * @param options.textColor Optional string specifying a custom text color key to use instead of 'rizzleText'
 * @returns void
 */
export const useHeaderStyle = (options?: {
  variant?: string,
  customColor?: string
  bgVariant?: string,
  bgColor?: string,
  textColor?: string
}) => {
  const navigation = useNavigation()
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  const bgColorKey = options?.bgColor || 'rizzleBG'
  const textColorKey = options?.textColor || 'rizzleText'
  const bgVariant = options?.bgVariant || (Platform.OS === 'android' ? 'darker' : '')

  useLayoutEffect(() => {
    // setOptions merges with existing options rather than replacing them completely
    // For nested objects like headerTitleStyle, it also performs a shallow merge
    // This means we only need to specify the properties we want to change
    // BUT this doesn't seem to be working
    navigation.setOptions({
      ...headerOptions,
      headerStyle: {
        ...headerOptions.headerStyle,
        backgroundColor: isDarkMode
          ? hslString(bgColorKey)
          : hslString(bgColorKey, bgVariant),
      },
      headerTintColor: hslString(textColorKey),
      headerTitleStyle: {
        ...headerOptions.headerTitleStyle,
        // Only updating the color property preserves other styles like font family,
        // font size, etc. that are set globally in App.tsx
        color: hslString(textColorKey)
      },
      headerBackTitleStyle: {
        ...headerOptions.headerBackTitleStyle,
        color: hslString(textColorKey)
      }
    })
  }, [isDarkMode, bgColorKey, textColorKey, bgVariant, navigation])
}

export default useHeaderStyle
