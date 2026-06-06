# Face Detection Migration Plan

## Background

Currently using TensorFlow.js with BlazeFace model for face detection on images (`utils/face-detection.ts`). TensorFlow.js is not compatible with React Native's new architecture, so we need to migrate to a new solution.

## Current Dependencies to Replace

```json
"@tensorflow-models/blazeface": "0.1.0",
"@tensorflow/tfjs": "4.16.0",
"@tensorflow/tfjs-react-native": "1.0.0",
```

## Chosen Solution

**react-native-fast-tflite** + **react-native-image-processing**

### Why this approach?

1. ✅ **New architecture compatible** - Both libraries support React Native's new architecture
2. ✅ **On-device processing** - No remote API calls, privacy-preserving
3. ✅ **Native performance** - Much faster than TensorFlow.js
4. ✅ **Simple integration** - Similar API to current implementation
5. ✅ **Active maintenance** - Both libraries actively maintained

### Libraries

1. **react-native-image-processing** ([GitHub](https://github.com/adiTrivsme/react-native-image-processing))
   - Converts images to tensors natively
   - Handles resize, color format, normalization
   - Returns plain `number[]` arrays

2. **react-native-fast-tflite** ([GitHub](https://github.com/mrousavy/react-native-fast-tflite))
   - High-performance TensorFlow Lite library
   - JSI-based (zero-copy ArrayBuffers)
   - Supports GPU delegates (CoreML/Metal/OpenGL)

## Migration Steps

### 1. Install Dependencies

```bash
npm install react-native-image-processing react-native-fast-tflite
# or
yarn add react-native-image-processing react-native-fast-tflite
```

### 2. Update metro.config.js

Add `.tflite` as a supported asset extension:

```javascript
module.exports = {
  // ...
  resolver: {
    assetExts: ['tflite' /* ...existing extensions */]
    // ...
  }
}
```

### 3. Convert BlazeFace Model to TFLite

Need to convert the BlazeFace model from TensorFlow.js format to TensorFlow Lite (`.tflite`) format.

**Options:**

- Find pre-converted BlazeFace `.tflite` model online
- Convert using TensorFlow's converter tools
- Use MediaPipe's Face Detection model (similar to BlazeFace, already in TFLite format)

**Model requirements:**

- Input: 128x128 or 256x256 RGB image
- Output: Bounding boxes and confidence scores

### 4. Updated Implementation

**File:** `utils/face-detection.ts`

```typescript
import { getTensorObj } from 'react-native-image-processing'
import { loadTensorflowModel } from 'react-native-fast-tflite'
import * as FileSystem from 'expo-file-system'

interface dimensions {
  width: number
  height: number
}

let tfModel

export async function faceDetection(imageFileName: string, dimensions: dimensions) {
  // Load BlazeFace TFLite model
  tfModel = tfModel || (await loadTensorflowModel(require('assets/blazeface.tflite')))

  try {
    // Convert image to tensor using react-native-image-processing
    // BlazeFace typically uses 128x128 or 256x256 input
    const { tensor, shape } = getTensorObj(imageFileName, {
      inputDimensions: { width: 128, height: 128 },
      colorFormat: 'RGB',
      normalization: 'zeroToOne', // or 'none' depending on model
      outDType: 'float32',
      tensorLayout: 'NHWC', // Check what BlazeFace expects
      resizeStrategy: 'centerCrop',
      orientationHandling: 'respectExif'
    })

    // Run TFLite model
    const outputs = await tfModel.run([tensor])

    // Parse BlazeFace outputs
    // outputs[0] = bounding boxes
    // outputs[1] = scores/probabilities
    const faces = parseBlazeFaceOutputs(outputs, shape)

    if (!faces || faces.length === 0) return

    // Map from 128x128 coordinates back to original image dimensions
    const mainFace = faces[0]
    const scaleX = dimensions.width / 128
    const scaleY = dimensions.height / 128

    const centreX = mainFace.x * scaleX
    const centreY = mainFace.y * scaleY

    return {
      x: centreX / dimensions.width,
      y: centreY / dimensions.height
    }
  } catch (e) {
    console.error('Face detection error:', e)
    return
  }
}

function parseBlazeFaceOutputs(outputs: number[][], shape: number[]) {
  // Parse based on your specific BlazeFace model's output format
  // This depends on which BlazeFace variant you're using
  const boxes = outputs[0]
  const scores = outputs[1]

  // TODO: Implement parsing logic based on model outputs
  // Return array of face objects with x, y coordinates and confidence
  return []
}
```

### 5. Configuration Options for getTensorObj

Available options for `react-native-image-processing`:

```typescript
{
  inputDimensions: { width: 224, height: 224 },
  colorFormat: 'RGB' | 'RGBA' | 'BGR' | 'Grayscale',
  normalization: 'zeroToOne' | 'none' | 'minusOneToOne' | 'meanStd',
  mean: { r: number; g: number; b: number },
  std: { r: number; g: number; b: number },
  outDType: 'float32' | 'uint8' | 'int8',
  channelOrder: 'interleaved' | 'planar',
  resizeStrategy: 'centerCrop' | 'stretch' | 'aspectFit' | 'aspectFill',
  tensorLayout: 'NHWC' | 'NCHW',
  orientationHandling: 'respectExif' | 'ignoreExif',
  alphaHandling: 'dropAlpha' | 'premultiply' | 'keep'
}
```

## Alternative Options (Not Chosen)

### expo-face-detector

- **Pros:** Native, on-device, simple API
- **Cons:** May not support new architecture, less control over model
- Uses Google Mobile Vision framework
- **Status:** Need to verify new architecture compatibility

### Vision Camera + react-native-fast-tflite

- **Pros:** Best for real-time camera face detection
- **Cons:** Overkill for static image processing
- We're only processing static images, not camera frames

### MediaPipe Face Detection

- **Pros:** Modern, Google-maintained, on-device
- **Cons:** Different API, may require more setup
- Could be a good alternative if BlazeFace conversion is difficult

## GPU Acceleration (Optional)

### iOS - CoreML Delegate

For Expo, add to `app.json`:

```json
{
  "plugins": [
    [
      "react-native-fast-tflite",
      {
        "enableCoreMLDelegate": true
      }
    ]
  ]
}
```

For bare React Native:

1. Add `$EnableCoreMLDelegate=true` to Podfile
2. Add CoreML framework in Xcode
3. Run `pod install`

### Android - GPU Delegate

Add to `app.json`:

```json
{
  "plugins": [
    [
      "react-native-fast-tflite",
      {
        "enableAndroidGpuLibraries": true
      }
    ]
  ]
}
```

## Testing Checklist

- [ ] Install dependencies
- [ ] Update metro.config.js
- [ ] Convert/obtain BlazeFace TFLite model
- [ ] Place model in assets folder
- [ ] Implement new face detection function
- [ ] Test with sample images
- [ ] Verify face detection accuracy vs old implementation
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Performance benchmarking
- [ ] Remove old TensorFlow.js dependencies

## Resources

- [react-native-fast-tflite GitHub](https://github.com/mrousavy/react-native-fast-tflite)
- [react-native-image-processing GitHub](https://github.com/adiTrivsme/react-native-image-processing)
- [TensorFlow Lite Models Hub](https://tfhub.dev)
- [BlazeFace TensorFlow Hub](https://tfhub.dev/google/lite-model/blazeface/1/default/1)
- [MediaPipe Face Detection](https://developers.google.com/mediapipe/solutions/vision/face_detector)

## Notes

- Current implementation in `utils/face-detection.ts` resizes images to 1/4 size before processing
- Returns normalized face center coordinates (x, y as 0-1 range)
- Selects face with highest confidence score if multiple faces detected
- Need to inspect BlazeFace model output format using [Netron](https://netron.app) to understand tensor shapes and implement parsing logic correctly
