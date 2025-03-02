import React from 'react'
import { View, Text, ScrollView } from 'react-native'

const WebView = props => {
  // Extract the HTML content from the source prop
  let content = ''
  if (props.source) {
    if (props.source.html) {
      content = props.source.html
    } else if (props.source.uri) {
      content = `URI: ${props.source.uri}`
    }
  }

  // Pass through the style prop
  return (
    <View 
      {...props} 
      testID={props.testID || 'mock-webview'}
    >
      <ScrollView>
        <Text>{content}</Text>
      </ScrollView>
    </View>
  )
}

WebView.NavigationType = {
  linkActivated: 'linkActivated',
  formSubmitted: 'formSubmitted',
  backForward: 'backForward',
  reload: 'reload',
  formResubmitted: 'formResubmitted',
  other: 'other',
}

// Export as both default and named export to handle different import styles
export default WebView
export { WebView }