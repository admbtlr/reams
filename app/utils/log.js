import { Sentry } from 'react-native-sentry'

export default function log (functionName, err) {
  // debugger
  console.log(`Error at ${functionName}: ${err}`)
  Sentry.captureMessage(`Error at ${functionName}: ${err}`)
  Sentry.captureException(err)
}

export function consoleLog(txt, showLogs = __DEV__) {
  if (showLogs) {
    consoleLog(txt)
  }
}
