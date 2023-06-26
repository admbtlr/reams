import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Appearance } from 'react-native'
import { DarkModeSetting, SET_DARK_MODE } from '../store/ui/types'
import { RootState } from '../store/reducers'

export default function DarkModeListener () {
  const dispatch = useDispatch()
  const darkModeSetting = useSelector((state: RootState) => state.ui.darkModeSetting)
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme()
    if (darkModeSetting === DarkModeSetting.AUTO) {
      dispatch({ 
        type: SET_DARK_MODE,
        isDarkMode: colorScheme === 'dark' 
      })  
    }
  })

  return null
}
