import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Appearance } from 'react-native'
import { SET_DARK_MODE } from '../store/ui/types'

export default function DarkModeListener () {
  const dispatch = useDispatch()
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme()
    dispatch({ 
      type: SET_DARK_MODE,
      isDarkMode: colorScheme === 'dark' })  
  })

  return null
}
