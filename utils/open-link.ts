import * as WebBrowser from 'expo-web-browser'
import { hslString } from './colors'
import log from './log'

export const openLink = async (url: string, tintColor = hslString('logo1')) => {
  try {
    await WebBrowser.openBrowserAsync(url)
    // const result = await InAppBrowser.open(url, {
    //   // iOS Properties
    //   animated: true,
    //   dismissButtonStyle: 'close',
    //   modalEnabled: true,
    //   preferredBarTintColor: 'white',
    //   preferredControlTintColor: tintColor,
    //   readerMode: false,
    //   // Android Properties
    //   showTitle: true,
    //   toolbarColor: '#6200EE',
    //   secondaryToolbarColor: 'black',
    //   forceCloseOnRedirection: false,
    //   // Specify full animation resource identifier(package:anim/name)
    //   // or only resource name(in case of animation bundled with app).
    //   animations: {
    //     startEnter: 'slide_in_bottom',
    //     startExit: 'slide_out_bottom',
    //     endEnter: 'slide_in_bottom',
    //     endExit: 'slide_out_bottom',
    //   },
    // })
  } catch (error) {
    log('openLink', error)
  }
}
