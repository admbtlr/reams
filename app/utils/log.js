import { Platform } from 'react-native'
import * as Sentry from 'sentry-expo'

export default function log (functionName, err, info) {
  const output = (typeof err === 'object' && err.name) ? `${err.name}: ${err.message}` : err
  // debugger
  console.log(`Error at ${functionName}: ${output}`)
  if (info) {
    console.log(info)
  }
  if (Platform.OS === 'web') {
    Sentry.Browser.captureMessage(`Error at ${functionName}: ${output}`)
    Sentry.Browser.captureException(err)
  } else {
    Sentry.Native.captureMessage(`Error at ${functionName}: ${output}`)
    Sentry.Native.captureException(err)
  }
}

export function consoleLog(txt, showLogs = __DEV__) {
  if (showLogs) {
    console.log(txt)
  }
}
