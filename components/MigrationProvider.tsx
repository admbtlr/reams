import React, { ReactNode, useEffect } from 'react'
import { ActivityIndicator, Dimensions, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { SET_MIGRATION_VERSION } from '../store/config/types'
import { store } from '../store'
import { addFeed } from '../backends/reams'
import { hslString } from '../utils/colors'
import { Image } from 'react-native'
import { Text } from 'react-native'
import { fontSizeMultiplier } from '../utils/dimensions'
// import { migrate } from '../store/migrations'

const CURRENT_VERSION = 17

const migrations = [
  async (store: RootState) => {
    console.log('migration 1')
  },
  async (store: RootState) => {
    // add feeds to supabase
    console.log('migration 2: adding feeds to supabase')
    const results = await Promise.allSettled(store.feeds.feeds.map(feed => addFeed(feed)))
    // for (const feed of store.feeds.feeds) {
    //   console.log('adding feed', feed.title || feed.url)
    //   try {
    //     await addFeed(feed)
    //   } catch (e) {
    //     console.error('error adding feed', e)
    //   }
    // }
    console.log('migration 2: done')
  },
]

const MigrationProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const dispatch = useDispatch()
  // const session = useSession()
  const version = useSelector((state: RootState) => state.config.migrationVersion)
  // const store = useSelector((state: RootState) => state)
  const [isMigrating, setIsMigrating] = React.useState(true)
  const { height, width } = Dimensions.get('window')

  useEffect(() => {
    console.log('migration provider useEffect version: ', version)
    // new install, no need to migrate anything
    if (version === undefined) {
      dispatch({ type: SET_MIGRATION_VERSION, version: CURRENT_VERSION })
    }
    const todo = migrations.slice(version)
    const doMigrations = async () => {
      for (const migration of todo) {
        await migration(store.getState())
      }
      setIsMigrating(false)
      dispatch({ type: SET_MIGRATION_VERSION, version: CURRENT_VERSION })
    }
    doMigrations()
  }, [])

  return isMigrating ?
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: hslString('rizzleBG', 'strict'),
        justifyContent: 'center',
        alignItems: 'center'
        // opacity: interpolate
      }}
    >
      <Image
        source={require('../assets/images/ream.png')}
        style={{
          // flex: 1,
          height: 256,
          width: 256
        }}
      />
      <View style={{
        position: 'absolute',
        bottom: 100,
        // left: width * 0.333,
        zIndex: 10,
      }}>
        <ActivityIndicator size="large" color={hslString('rizzleFG')} />
        <Text
          style={{
            fontFamily: 'IBMPlexMono',
            color: hslString('logo3'),
            fontSize: 20 * fontSizeMultiplier(),
            textAlign: 'center',
            marginTop: 40
          }}>Migrating data</Text>
      </View>
    </View> :
    <>{children}</>
}

export default MigrationProvider
