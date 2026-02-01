import React, { useState, useEffect } from 'react'
import { Modal, View, Image, Text } from 'react-native'
import ImageViewer from 'react-native-reanimated-image-viewer'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { fontSizeMultiplier } from '../utils/dimensions'
import { textInfoStyle } from '../utils/styles'
import XButton from './XButton'
import { getCachedImageForItem } from '../utils/imageCache'

const RizzleImageViewer = (props) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageUrl, setImageUrl] = useState(props.url)

  useEffect(() => {
    if (props.isVisible && props.url && props.itemId) {
      setImageLoaded(false)
      
      // Try to get cached image
      const loadImage = async () => {
        try {
          // Check if image is already cached for this item
          const cachedPath = await getCachedImageForItem(props.itemId, props.url)
          
          const urlToUse = cachedPath || props.url
          setImageUrl(urlToUse)
          
          // Get the actual image dimensions
          Image.getSize(
            urlToUse,
            (width, height) => {
              setImageDimensions({ width, height })
              setImageLoaded(true)
            },
            (error) => {
              console.error('Failed to get image size:', error)
              // Set default dimensions if we can't get the size
              setImageDimensions({ width: 1000, height: 1000 })
              setImageLoaded(true)
            }
          )
        } catch (error) {
          console.error('Failed to load cached image:', error)
          // Fallback to original URL
          setImageUrl(props.url)
          Image.getSize(
            props.url,
            (width, height) => {
              setImageDimensions({ width, height })
              setImageLoaded(true)
            },
            (error) => {
              console.error('Failed to get image size:', error)
              setImageDimensions({ width: 1000, height: 1000 })
              setImageLoaded(true)
            }
          )
        }
      }
      
      loadImage()
    }
  }, [props.isVisible, props.url, props.itemId])

  if (!props.isVisible) {
    return null
  }

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType='fade'
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'rgba(30,30,30,0.95)' }}>
        {imageLoaded && (
          <ImageViewer
            imageUrl={imageUrl}
            width={imageDimensions.width}
            height={imageDimensions.height}
            onRequestClose={props.hideImageViewer}
            onSingleTap={props.hideImageViewer}
          />
        )}
        <View style={{
          position: 'absolute',
          right: 10 * fontSizeMultiplier(),
          top: 10 * fontSizeMultiplier(),
          zIndex: 1000
        }}>
          <XButton
            isLight={true}
            onPress={props.hideImageViewer} />
        </View>
        <View style={{ 
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Text style={{
            ...textInfoStyle,
            color: 'white',
            textAlign: 'center',
          }}>Pinch to zoom. Swipe up to close.</Text>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

export default RizzleImageViewer
