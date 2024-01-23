import ImageResizer from 'react-native-image-resizer'
import * as FileSystem from 'expo-file-system'
import { decodeJpeg } from '@tensorflow/tfjs-react-native'
import * as tf from '@tensorflow/tfjs'
import log from './log'
import { BlazeFaceModel } from '@tensorflow-models/blazeface'
const blazeface = require('@tensorflow-models/blazeface')

interface dimensions { width: number, height: number}

let tfModel: BlazeFaceModel

export async function faceDetection (imageFileName: string, dimensions: dimensions ) {
  let faces
  tfModel = tfModel || await blazeface.load()
  try {
    const resized = await resizeImage(imageFileName, dimensions)
    const imgB64 = await FileSystem.readAsStringAsync(resized, {
      encoding: FileSystem.EncodingType.Base64,
    })
    const imageData = tf.util.encodeString(imgB64, 'base64')

    // Decode image data to a tensor
    const imageTensor = decodeJpeg(imageData);

    faces = await tfModel.estimateFaces(imageTensor)
    await FileSystem.deleteAsync(resized)
    // console.log(faces)  
  } catch (e) {
    log(e)
    return
  }

  const mapFromResized = async (coords: tf.Tensor1D | [number, number]) => {
    const numCoords = Array.isArray(coords) ? coords : await coords.array()
    return numCoords.map(c => c * 4)
  }
  if (!faces || faces.length === 0) return
  const resizedFace = faces.sort((a, b) => {
    return (typeof b.probability === 'number' ? b.probability : 0) - (typeof a.probability === 'number' ? a.probability : 0)
  })[0]
  const mainFace = {
    topLeft: await mapFromResized(resizedFace.topLeft),
    bottomRight: await mapFromResized(resizedFace.bottomRight)
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