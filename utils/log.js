import * as Sentry from '@sentry/react-native'

export default function log (functionName, err, info) {
  const output = (typeof err === 'object' && err.name) ? `${err.name}: ${err.message}` : err
  // debugger
  console.log(`Error at ${functionName}: ${output}`)
  if (info) {
    console.log(info)
  }
  Sentry.captureMessage(`Error at ${functionName}: ${output}`)
  Sentry.captureException(err)
}

export function consoleLog(txt, showLogs = __DEV__) {
  if (showLogs) {
    console.log(txt)
  }
}
