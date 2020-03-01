import React from 'react'
import { Dimensions, Modal, View } from 'react-native'
// import Modal from 'react-native-modalbox'
import { VibrancyView } from 'react-native-blur'
import ImageViewer from 'react-native-image-zoom-viewer'

class RizzleImageViewer extends React.Component {

  constructor (props) {
    super(props)
    this.props = props
  }

  render () {
    const {height, width} = Dimensions.get('window')
    return this.props.isVisible ? (
      <View>
        <Modal
          visible={true}
          transparent={true}
          animationType='fade'
          >
          <ImageViewer
            backgroundColor='rgba(30,30,30,0.8)'
            enableSwipeDown={true}
            imageUrls={[{
              url: this.props.url
            }]}
            //loadingRender={() => <LogoSpinner />}
            renderIndicator={(currentIndex, allSize) => null}
            saveToLocalByLongPress={false}
            maxOverflow={0}
            onSwipeDown={this.props.hideImageViewer}/>
        </Modal>
      </View>
    ) : null
  }

  getStyles () {
    return {
      base: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      },
      inner: {
        backgroundColor: hslString('rizzleBG'),
        borderRadius: 20,
        width: '80%'
      },
      buttonHolder: {
        flexDirection: 'row',
        height: 40,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.3)'
      },
      textHolder: {
        margin: 20,
        marginTop: 15
      },
      text: {
        color: 'white',
        fontFamily: 'IBMPlexMono',
        fontSize: 16,
        textAlign: 'center'
      },
      title: {
        // color: hslString('rizzleHighlight'),
        marginBottom: 10,
        fontFamily: 'IBMPlexMono-Bold'
      },
      em: {
        fontFamily: 'IBMPlexMono-Italic'
      },
      strong: {
        fontFamily: 'IBMPlexMono-Bold'
      },
      strong_em: {
        fontFamily: 'IBMPlexMono-BoldItalic'
      },
      smaller: {
        fontSize: 15
      },
      yellow: {
        color: hslString('rizzleHighlight')
      },
      touchable: {
        flex: 1,
        borderColor: 'rgba(0,0,0,0.3)'
      },
      buttonText: {
        margin: 5,
        marginTop: 7,
        textAlign: 'center'
      }
    }
  }
}

export default RizzleImageViewer
