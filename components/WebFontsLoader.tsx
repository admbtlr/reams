import { useFonts } from 'expo-font'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

const MIN_FALLBACK_DURATION = 500

/**
 * For web only: include this to load woff2 fonts.
 * For native platforms, otf files are bundled via app.json.
 */
export function WebFontsLoader({
  children,
  fallback,
}: {
  children?: React.ReactNode
  fallback?: React.ReactNode
}) {
  const hasFallback = !!fallback
  const [forceFallback, setForceFallback] = useState(hasFallback)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setForceFallback(false)
    }, MIN_FALLBACK_DURATION)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const [loaded, error] = useFonts({
    'IBMPlexMono-Bold': require('../assets/fonts/IBMPlexMono-Bold.ttf'),
    'IBMPlexMono-BoldItalic': require('../assets/fonts/IBMPlexMono-BoldItalic.ttf'),
    'IBMPlexMono-Italic': require('../assets/fonts/IBMPlexMono-Italic.ttf'),
    'IBMPlexMono-Light': require('../assets/fonts/IBMPlexMono-Light.ttf'),
    'IBMPlexMono-LightItalic': require('../assets/fonts/IBMPlexMono-LightItalic.ttf'),
    'IBMPlexMono': require('../assets/fonts/IBMPlexMono.ttf'),
    'IBMPlexSans-Bold': require('../assets/fonts/IBMPlexSans-Bold.ttf'),
    'IBMPlexSans-BoldItalic': require('../assets/fonts/IBMPlexSans-BoldItalic.ttf'),
    'IBMPlexSans-Italic': require('../assets/fonts/IBMPlexSans-Italic.ttf'),
    'IBMPlexSans-Light': require('../assets/fonts/IBMPlexSans-Light.ttf'),
    'IBMPlexSans-LightItalic': require('../assets/fonts/IBMPlexSans-LightItalic.ttf'),
    'IBMPlexSans': require('../assets/fonts/IBMPlexSans.ttf'),
    'IBMPlexSansCond-Bold': require('../assets/fonts/IBMPlexSansCond-Bold.ttf'),
    'IBMPlexSansCond-BoldItalic': require('../assets/fonts/IBMPlexSansCond-BoldItalic.ttf'),
    'IBMPlexSansCond-ExtraLight': require('../assets/fonts/IBMPlexSansCond-ExtraLight.ttf'),
    'IBMPlexSansCond-ExtraLightItalic': require('../assets/fonts/IBMPlexSansCond-ExtraLightItalic.ttf'),
    'IBMPlexSansCond': require('../assets/fonts/IBMPlexSansCond.ttf'),
    'IBMPlexSerif-Bold': require('../assets/fonts/IBMPlexSerif-Bold.ttf'),
    'IBMPlexSerif-BoldItalic': require('../assets/fonts/IBMPlexSerif-BoldItalic.ttf'),
    'IBMPlexSerif-Italic': require('../assets/fonts/IBMPlexSerif-Italic.ttf'),
    'IBMPlexSerif-Light': require('../assets/fonts/IBMPlexSerif-Light.ttf'),
    'IBMPlexSerif-LightItalic': require('../assets/fonts/IBMPlexSerif-LightItalic.ttf'),
    'IBMPlexSerif': require('../assets/fonts/IBMPlexSerif.ttf'),
    'LibreBaskerville-Bold': require('../assets/fonts/LibreBaskerville-Bold.ttf'),
    'LibreBaskerville-Italic': require('../assets/fonts/LibreBaskerville-Italic.ttf'),
    'LibreBaskerville-Regular': require('../assets/fonts/LibreBaskerville-Regular.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-BoldItalic': require('../assets/fonts/Montserrat-BoldItalic.ttf'),
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Italic': require('../assets/fonts/Montserrat-Italic.ttf'),
    'NunitoSans-Bold': require('../assets/fonts/NunitoSans-Bold.ttf'),
    'NunitoSans-BoldItalic': require('../assets/fonts/NunitoSans-BoldItalic.ttf'),
    'NunitoSans-Regular': require('../assets/fonts/NunitoSans-Regular.ttf'),
    'NunitoSans-Italic': require('../assets/fonts/NunitoSans-Italic.ttf'),
    'PTSerif-Bold': require('../assets/fonts/PTSerif-Bold.ttf'),
    'PTSerif-BoldItalic': require('../assets/fonts/PTSerif-BoldItalic.ttf'),
    'PTSerif-Italic': require('../assets/fonts/PTSerif-Italic.ttf'),
    'PTSerif-Regular': require('../assets/fonts/PTSerif-Regular.ttf'),
    'PlayfairDisplay-Black': require('../assets/fonts/PlayfairDisplay-Black.ttf'),
    'PlayfairDisplay-BlackItalic': require('../assets/fonts/PlayfairDisplay-BlackItalic.ttf'),
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'PlayfairDisplay-BoldItalic': require('../assets/fonts/PlayfairDisplay-BoldItalic.ttf'),
    'PlayfairDisplay-Italic': require('../assets/fonts/PlayfairDisplay-Italic.ttf'),
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplaySC-Bold': require('../assets/fonts/PlayfairDisplaySC-Bold.ttf'),
    'PlayfairDisplaySC-BoldItalic': require('../assets/fonts/PlayfairDisplaySC-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-Italic': require('../assets/fonts/Poppins-Italic.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Reforma1969-Blanca': require('../assets/fonts/Reforma1969-Blanca.ttf'),
    'Reforma1969-BlancaItalica': require('../assets/fonts/Reforma1969-BlancaItalica.ttf'),
    'Reforma1969-Negra': require('../assets/fonts/Reforma1969-Negra.ttf'),
    'Reforma1969-NegraItalica': require('../assets/fonts/Reforma1969-NegraItalica.ttf'),
    'Reforma2018-Blanca': require('../assets/fonts/Reforma2018-Blanca.ttf'),
    'Reforma2018-BlancaItalica': require('../assets/fonts/Reforma2018-BlancaItalica.ttf'),
    'Reforma2018-Negra': require('../assets/fonts/Reforma2018-Negra.ttf'),
    'Reforma2018-NegraItalica': require('../assets/fonts/Reforma2018-NegraItalica.ttf'),
  })

  if (error) console.error(error)

  return loaded ? children : fallback
}
