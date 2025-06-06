import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSelector } from 'react-redux'
import { RootState } from '../store/reducers'

export default function SourceLikedMuted({ source_id }: { source_id: string }) {
  const source = useSelector((state: RootState) => state.feeds.feeds.find(f => f._id === source_id) ??
    state.newsletters.newsletters.find(n => n._id === source_id))
  return (
    <View style={{
      position: 'absolute',
      top: 10,
      right: 7
    }}>
      {source?.isLiked &&
        <Svg
          height='32'
          width='32'>
          <Path
            d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
            strokeWidth={2}
            stroke='white'
            fill='white'
          />
        </Svg>
      }
      {source?.isMuted &&
        <Svg
          height='32'
          width='32'>
          <Path
            d='M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6'
            strokeWidth={2}
            stroke='white'
            fill='white'
          />
        </Svg>
      }
    </View>
  )
}
