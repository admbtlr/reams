import { Platform } from 'react-native'
import * as Sentry from '@sentry/react-native'
import { debugService } from './debug-service'

export default function log(functionName, err, info) {
  let output, error
  if (typeof functionName === 'object') {
    error = functionName
    output = `${error.name}: ${error.message}`
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
  if (Platform.OS === 'web' && Sentry.Browser) {
    Sentry.Browser.captureMessage(output)
    if (error) Sentry.Browser.captureException(error)
  } else if (!__DEV__) {
    Sentry.captureMessage(output)
    if (error) Sentry.captureException(error)
  }
  debugService.log(output, {})
}

export function consoleLog(txt, showLogs = __DEV__) {
  if (showLogs) {
    console.log(txt)
  }
}
