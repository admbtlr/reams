import {useEffect} from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useDispatch } from 'react-redux'
import { IS_ONLINE } from '../store/config/types'

export default ConnectionListener = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(({isInternetReachable}) => {
      dispatch({
        type: IS_ONLINE,
        isOnline: isInternetReachable
      })
    })
    return unsubscribe
  })

  return null
}
