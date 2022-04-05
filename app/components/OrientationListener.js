import {useEffect} from 'react'
import { Dimensions } from 'react-native'
import { useDispatch } from 'react-redux'
import { SET_ORIENTATION } from '../store/config/types'
import {isPortrait} from '../utils'

export default OrientationListener = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    const unsubscribe = Dimensions.addEventListener('change', () => {
      dispatch({
        type: SET_ORIENTATION,
        orientation: isPortrait() ? 'portrait' : 'landscape'       
      })
    })
    return unsubscribe
  })

  return null
}
