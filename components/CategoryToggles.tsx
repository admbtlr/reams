import React, { useState } from 'react'
import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import { fontSizeMultiplier, getMargin } from '../utils'
import { hslString } from '../utils/colors'
import { textInfoStyle } from '../utils/styles'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { Item } from '../store/items/types'
import { ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { ADD_FEED_TO_CATEGORY, ADD_ITEM_TO_CATEGORY, CREATE_CATEGORY, Category as CategoryType, REMOVE_FEED_FROM_CATEGORY, REMOVE_ITEM_FROM_CATEGORY } from '../store/categories/types'
import { Feed } from '../store/feeds/types'
import { SHOW_MODAL } from '../store/ui/types'

interface CategoryTogglesProps {
  feed?: Feed
  isWhite: boolean
  item?: Item
}

export default function CategoryToggles({ feed, isWhite, item }: CategoryTogglesProps) {
  const dispatch = useDispatch()
  const categories = useSelector((state: RootState) => state.categories.categories)
  const usedCategories = categories
    .filter(c => !c.isSystem && 
      (!!item ? c.itemIds?.includes(item._id) : c.feeds?.includes(feed._id)))
    .sort((a, b) => a.name.localeCompare(b.name))
  const unusedCategories = categories
    .filter(c => !c.isSystem && 
      (!!item ? !c.itemIds?.includes(item._id) : !c.feeds?.includes(feed._id)))
    .sort((a, b) => a.name.localeCompare(b.name))
  
  const getTouchableCategory = (category: CategoryType, feedId: string | undefined, isActive: boolean, itemId: string | undefined, key: number) => (
    <TouchableOpacity 
    key={key}
    onPress={() => {
      !!feedId ? (
        isActive ?
          dispatch({
            type: REMOVE_FEED_FROM_CATEGORY, 
            feedId, 
            categoryId: category._id
          }) :
          dispatch({
            type: ADD_FEED_TO_CATEGORY, 
            feedId, 
            categoryId: category._id
          })
     ) : (
      isActive ?
      dispatch({
        type: REMOVE_ITEM_FROM_CATEGORY, 
        itemId, 
        categoryId: category._id
      }) :
      dispatch({
        type: ADD_ITEM_TO_CATEGORY, 
        itemId, 
        categoryId: category._id
      })
     )
    }}
  >
    <Category 
      name={category.name} 
      isActive={isActive} 
      isWhite={isWhite}
    />
  </TouchableOpacity>

  )
  return (
    <View style={{
      flex: 0,
      flexDirection: 'column',
      // marginBottom: getMargin(),
      // marginLeft: -5,
      maxHeight: 24 * fontSizeMultiplier(),
      // paddingHorizontal: getMargin(),
      overflow: 'hidden',
      width: '100%'
    }}>
      <ScrollView 
        alwaysBounceHorizontal={false}
        horizontal={true}
        overScrollMode='never'
        showsHorizontalScrollIndicator={false}
        // style={{ 
        //   flex: 0,
        //   flexDirection: 'column',
        //   marginBottom: getMargin(),
        //   marginLeft: -5,
        //   maxHeight: 28 * fontSizeMultiplier(),
        //   paddingHorizontal: getMargin(),
        //   overflow: 'hidden',
        //   width: '100%'
        // }}
      >
        { usedCategories.map((c, index) => 
          getTouchableCategory(c, feed?._id, true, item?._id, index)
        )}
        { unusedCategories.map((c, index) => (
          getTouchableCategory(c, feed?._id, false, item?._id, index + 10000)
        ))}
        <AddCategory isWhite={isWhite} />
      </ScrollView>
    </View>
  )
}

interface CategoryProps {
  name?: string
  isActive?: boolean
  isWhite?: boolean
  isAdd?: boolean
}

function Category ({ name, isActive, isWhite, isAdd }: CategoryProps) {
  return (
    <View style={{
      backgroundColor: isActive ? (isWhite ? 'white' : hslString('rizzleText')) : 'transparent',
      borderRadius: 12 * fontSizeMultiplier(),
      paddingVertical: 3,
      height: 24 * fontSizeMultiplier(),
      marginRight: 8,
      marginBottom: 8,
      borderColor: isWhite ? 'white' : hslString('rizzleText', undefined, 0.5),
      borderWidth: 1
    }}>
      {
        isAdd ? 
          <View style={{ marginTop: -3 }}>
            {getRizzleButtonIcon('plus', isWhite ? 'white' : hslString('rizzleText'), 'white', true, true, 0.8)}
          </View> : (
          <Text style={{ 
            ...textInfoStyle(),
            fontSize: 12 * fontSizeMultiplier(),
            color: isActive ? 
              isWhite ? hslString('rizzleText') : 'white' : 
              isWhite ? 'white' : hslString('rizzleText', undefined, 0.8),
            margin: 0,
            marginLeft: 8,
            marginRight: 8,
            padding: 0
          }}>{ name }</Text>
        )
     }
    </View>
  )
}

const AddCategory = ({ isWhite }: { isWhite: boolean }) => {
  const dispatch = useDispatch()
  const createCategory = (name: string) => {
    dispatch({
      type: CREATE_CATEGORY,
      name
    })
  }
  const showModal = (modalProps: {}) => dispatch({
    type: SHOW_MODAL,
    modalProps
  })
  const showAddCategory = () => {
    const modalText = [
      {
        text: 'Create a new tag',
        style: ['title']
      }
    ]
    showModal({
      modalText,
      modalHideCancel: false,
      modalShow: true,
      inputs: [
        {
          label: 'Tag',
          name: 'categoryName',
          type: 'text',
        }
      ],
      modalOnOk: (state: {categoryName: string}) => {
        state.categoryName && createCategory(state.categoryName)
      },
      showKeyboard: true
    })
  }
  return (
    <TouchableOpacity onPress={showAddCategory}>
      <Category isAdd isWhite={isWhite}  />
    </TouchableOpacity>
  )
}

