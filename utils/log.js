import { Platform } from 'react-native'
import * as Sentry from '@sentry/react-native'

export default function log (functionName, err, info) {
  let output, error
  if (typeof functionName === 'object') {
    error = functionName
    output = `${e.name}: ${e.message}`
  } else {
    output = (typeof err === 'object' && err.name) ? `${err.name}: ${err.message}` : err
    error = err
  }
  // debugger
  console.error(output)
  if (info) {
    console.error(info)
  }
  if (error && error.stack) {
    console.error(error.stack)
  }
  if (Platform.OS === 'web') {
    Sentry.Browser.captureMessage(output)
    if (error) Sentry.Browser.captureException(error)
  } else {
    Sentry.captureMessage(output)
    if (error) Sentry.captureException(error)
  }
}

export function consoleLog(txt, showLogs = __DEV__) {
  if (showLogs) {
    console.log(txt)
  }
}
