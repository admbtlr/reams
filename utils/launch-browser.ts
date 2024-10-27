import InAppBrowser from "react-native-inappbrowser-reborn"
import { hslString } from "./colors"

export default async function launchBrowser (url: string) {
  if (!url) return
  try {
    await InAppBrowser.isAvailable()
    InAppBrowser.open(url, {
      // iOS Properties
      dismissButtonStyle: 'close',
      preferredBarTintColor: hslString('rizzleBG'),
      preferredControlTintColor: hslString('rizzleText'),
      animated: true,
      modalEnabled: true,
      // modalPresentationStyle: "popover",
      // readerMode: true,
      enableBarCollapsing: true,
    })
  } catch (error) {
    console.log('openLink', error)
  }
}
