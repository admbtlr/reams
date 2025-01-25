import React, { useState } from 'react'
import { View, Text, Pressable, TouchableOpacity, Animated, Easing } from 'react-native'
import { id } from '../utils'
import { fontSizeMultiplier, getMargin } from '../utils/dimensions'
import { hslString } from '../utils/colors'
import { textInfoItalicStyle, textInfoMonoStyle, textInfoStyle } from '../utils/styles'
import { getRizzleButtonIcon } from '../utils/rizzle-button-icons'
import { Item } from '../store/items/types'
import { ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/reducers'
import { Category as CategoryType } from '../store/categories/types'
import { Feed } from '../store/feeds/types'
import { useModal } from './ModalProvider'
import debounce from 'lodash.debounce'
import { 
  createCategory as createCategoryAction,
  updateCategory as updateCategoryAction 
} from '../store/categories/categoriesSlice'

interface CategoryTogglesProps {
  feed?: Feed
  isWhite: boolean
  item?: Item
}

export default function CategoryToggles({ feed, isWhite, item }: CategoryTogglesProps) {
  const dispatch = useDispatch()
  const [isExpanded, setIsExpanded] = useState(false)
  const categories = useSelector((state: RootState) => state.categories.categories)
  const usedCategories = categories
    .filter(c => !c.isSystem && 
      (!!item ? c.itemIds?.includes(item._id) : feed && c.feedIds?.includes(feed._id)))
    .sort((a, b) => a.name.localeCompare(b.name))
  const unusedCategories = categories
    .filter(c => !c.isSystem && 
      (!!item ? !c.itemIds?.includes(item._id) : feed && !c.feedIds?.includes(feed._id)))
    .sort((a, b) => a.name.localeCompare(b.name))
  
  const getTouchableCategory = (category: CategoryType, feedId: string | undefined, isActive: boolean, itemId: string | undefined, key: number) => {
    const pulseValue = new Animated.Value(1, { useNativeDriver: true })
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.quad
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.quad
        })
      ])
    )
    return (
      <Animated.View 
        key={key}
        style={{
          opacity: pulseValue
        }}
      >
        <TouchableOpacity 
          onPress={() => {
            pulseLoop.start()
            debounce(() => {
              !!feedId ? (
                isActive ?
                  dispatch(updateCategoryAction({ ...category, feedIds: category.feedIds.filter(f => f !== feedId) }) ) :
                  dispatch(updateCategoryAction({ ...category, feedIds: [...category.feedIds, feedId] }) )
              ) : (
                isActive ?
                  dispatch(updateCategoryAction({ ...category, itemIds: category.itemIds.filter(i => i !== itemId) }) ) :
                  dispatch(updateCategoryAction({ ...category, itemIds: [...category.itemIds, itemId] }) )
              )
            }, 1000)()
          }}
          style={{
            opacity: pulseValue
          }}
        >
          <Category 
            name={category.name} 
            isActive={isActive} 
            isWhite={isWhite}
          />
        </TouchableOpacity>
      </Animated.View>
    )
  }
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
      >
        { usedCategories.length === 0 &&
          getRizzleButtonIcon('tag', isWhite ? 'white' : hslString('rizzleText'), 'white', true, false, 0.75) 
        }
        { usedCategories.map((c, index) => 
          getTouchableCategory(c, feed?._id, true, item?._id, index)
        )}
        { isExpanded ? (
            <>
              {unusedCategories.map((c, index) => (
                getTouchableCategory(c, feed?._id, false, item?._id, index + 10000)
              ))}
              <AddCategory isWhite={isWhite} feed={feed} item={item} />
            </>
          ) : (
            <TouchableOpacity onPress={() => setIsExpanded(true) }>
              <Category isAdd isWhite={isWhite}  />
            </TouchableOpacity>
          )
        }
        
      </ScrollView>
    </View>
  )
}

interface CategoryProps {
  name?: string
  isActive?: boolean
  isWhite?: boolean
  isAdd?: boolean
  isItalic?: boolean
}

function Category ({ name, isActive, isWhite, isAdd, isItalic }: CategoryProps) {
  const textBaseStyle = isItalic ? 
    textInfoItalicStyle() :
    textInfoStyle()
  return (
    <View style={{
      backgroundColor: isActive ? (isWhite ? 'white' : hslString('rizzleText')) : 'transparent',
      borderRadius: 12 * fontSizeMultiplier(),
      paddingVertical: 3,
      height: 20 * fontSizeMultiplier(),
      marginRight: 8,
      marginBottom: 8,
      borderColor: isWhite ? 'white' : hslString('rizzleText', undefined, 0.5),
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center'
    }}>
      {
        isAdd ? 
          <View style={{ marginTop: -1 }}>
            {getRizzleButtonIcon('plus', isWhite ? 'white' : hslString('rizzleText'), 'white', true, true, 0.7)}
          </View> : (
          <Text style={{ 
            ...textBaseStyle,
            fontSize: 12 * fontSizeMultiplier(),
            color: isActive ? 
              isWhite ? hslString('rizzleText') : 'white' : 
              isWhite ? 'white' : hslString('rizzleText', undefined, 0.8),
            margin: 0,
            marginLeft: 8,
            marginRight: 8,
            marginTop: -2,
            padding: 0
          }}>{ name }</Text>
        )
     }
    </View>
  )
}

const AddCategory = ({ feed, isWhite, item }: { feed: Feed | undefined, isWhite: boolean, item: Item | undefined }) => {
  const { openModal } = useModal()
  const dispatch = useDispatch()
  const createCategory = (name: string) => {
    const category = {
      _id: id() as string,
      name,
      isSystem: false,
      feedIds: [],
      itemIds: []
    }
    dispatch(createCategoryAction(category))
    dispatch(feed ? 
      updateCategoryAction({ ...category, feedIds: [...category.feedIds, feed._id] }) : 
      updateCategoryAction({ ...category, itemIds: [...category.itemIds, item._id] })
    )
  }
  const showAddCategory = () => {
    const modalText = [
      {
        text: 'Create a new tag',
        style: ['title']
      }
    ]
    openModal({
      modalText,
      modalHideCancel: false,
      inputs: [
        {
          label: 'Tag',
          name: 'categoryName',
          type: 'text',
          value: '',
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

