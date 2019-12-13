import * as Sentry from '@sentry/react-native'

export default function log (functionName, err) {
  const output = err.name ? `${err.name}: ${err.message}` : err
  // debugger
  console.log(`Error at ${functionName}: ${output}`)
  Sentry.captureMessage(`Error at ${functionName}: ${output}`)
  Sentry.captureException(err)
}

export function consoleLog(txt, showLogs = __DEV__) {
  if (showLogs) {
    consoleLog(txt)
  }
}
