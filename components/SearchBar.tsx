import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, Text, TextInput, View } from "react-native"
import { getMargin } from '../utils/dimensions'
import { textInfoStyle, textInputStyle } from '../utils/styles'
import TextButton from './TextButton'
import { useDispatch, useSelector } from 'react-redux'
import { SET_SEARCH_TERM } from '../store/config/types'
import { UPDATE_CURRENT_INDEX } from '../store/items/types'
import { getDisplay } from '../sagas/selectors'

const SearchBar = ({ navigation }) => {
  const displayMode = useSelector(getDisplay)
  const [ term, setTerm ] = useState('')
  const dispatch = useDispatch()
  const doSearch = () => {
    dispatch({
      type: SET_SEARCH_TERM,
      term
    })
    dispatch({
      type: UPDATE_CURRENT_INDEX,
      index: 0,
      displayMode
    })
    navigation.navigate('Items', { 
      feedCardX: 0,
      feedCardY: 0,
      feedCardWidth: Dimensions.get('screen').width,
      feedCardHeight: Dimensions.get('screen').height,
      toItems: true
    })
  }


  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'baseline',
      height: 40,
      marginHorizontal: getMargin(),
      marginVertical: getMargin() / 2
    }}>
      <Text style={{ 
        ...textInfoStyle(),
        marginLeft: 0,
        marginRight: getMargin() / 2,
        padding: 0,
        flex: 0,
      }}>Search for: </Text>
      <TextInput
        autoFocus={true}
        onChangeText={(text) => setTerm(text)}
        style={{
          ...textInputStyle(),
          marginRight: getMargin() / 2,
          flex: 1
        }}/>
      <TextButton 
        text='Go' 
        isCompact={true}
        onPress={doSearch}
        buttonStyle={{
          flex: 0,
          maxWidth: 50
        }}
      />
    </View>
  )
}

export default SearchBar