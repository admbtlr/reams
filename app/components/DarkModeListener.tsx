import React from 'react'
import { useDispatch } from 'react-redux'
import { useDarkMode } from 'react-native-dark-mode'
import { SET_DARK_MODE } from '../store/ui/types'

export default function DarkModeListener () {
  const dispatch = useDispatch()
  dispatch({ 
    type: SET_DARK_MODE,
    isDarkMode: useDarkMode() })

  return null
}
