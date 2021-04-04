import ImageResizer from 'react-native-image-resizer'
import * as FileSystem from 'expo-file-system'
import { decodeJpeg } from '@tensorflow/tfjs-react-native'
import * as tf from '@tensorflow/tfjs'

interface dimensions { width: number, height: number}

const blazeface = require('@tensorflow-models/blazeface')
let tfModel: any = null

export async function faceDetection (imageFileName: string, dimensions: dimensions ) {
  let faces
  tfModel = tfModel || await blazeface.load()
  try {
    const uri = `file:///${imageFileName}`
    const resized = await resizeImage(uri, dimensions)
    const imgB64 = await FileSystem.readAsStringAsync(resized, {
      encoding: FileSystem.EncodingType.Base64,
    })
    const imageData = tf.util.encodeString(imgB64, 'base64')

    // Decode image data to a tensor
    const imageTensor = decodeJpeg(imageData);

    faces = await tfModel.estimateFaces(imageTensor)
    await FileSystem.deleteAsync(resized)
    console.log(faces)  
  } catch (e) {
    console.log(e.message)
    return
  }

  // const faces = await vision().faceDetectorProcessImage(imageFileName)
  if (!faces || faces.length === 0) return
  const resizedFace = faces.sort((a, b) => b.probability - a.probability)[0]
  const mainFace = {
    topLeft: resizedFace.topLeft.map((x: number) => x * 4),
    bottomRight: resizedFace.bottomRight.map((x: number) => x * 4)
  }
  const centreX = mainFace.topLeft[0] +
    (mainFace.bottomRight[0] - mainFace.topLeft[0]) / 2
  const centreY = mainFace.topLeft[1] +
    (mainFace.bottomRight[1] - mainFace.topLeft[1]) / 2
  return {
    x: centreX / dimensions.width,
    y: centreY / dimensions.height
  }
}

async function resizeImage(uri: string, dimensions: dimensions) {
  const response = await ImageResizer.createResizedImage(uri, dimensions.width / 4, dimensions.height / 4, 'JPEG', 70)
  return response.uri
}