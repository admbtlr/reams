import { Sentry } from 'react-native-sentry'

export default function log (functionName, err) {
  console.log(`Error at ${functionName}: ${err}`)
  Sentry.captureMessage(`Error at ${functionName}: ${err}`)
  Sentry.captureException(err)
}