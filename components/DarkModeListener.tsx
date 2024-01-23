import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Appearance } from 'react-native'
import { DarkModeSetting, SET_DARK_MODE } from '../store/ui/types'
import { RootState } from '../store/reducers'

export default function DarkModeListener ({children}) {
  const dispatch = useDispatch()
  const darkModeSetting = useSelector((state: RootState) => state.ui.darkModeSetting)
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode)
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme()
    const isNew = colorScheme === 'dark' && !isDarkMode || colorScheme === 'light' && isDarkMode
    if (darkModeSetting === DarkModeSetting.AUTO && isNew) {
      dispatch({ 
        type: SET_DARK_MODE,
        isDarkMode: colorScheme === 'dark' 
      })  
    }
  })

  return children
}
