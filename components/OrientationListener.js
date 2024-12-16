import {useEffect} from 'react'
import { Dimensions } from 'react-native'
import { useDispatch } from 'react-redux'
import { SET_ORIENTATION } from '../store/config/types'
import { isPortrait } from '../utils/dimensions'

export default OrientationListener = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    Dimensions.addEventListener('change', () => {
      dispatch({
        type: SET_ORIENTATION,
        orientation: isPortrait() ? 'portrait' : 'landscape'       
      })
    })
    return () => {
      Dimensions.removeEventListener && Dimensions.removeEventListener('change')
    }
  })

  return null
}
