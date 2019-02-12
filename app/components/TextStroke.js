import React from 'react'
import {
  Svg,
  Text
} from 'react-native-svg'
import rnTextSize from 'react-native-text-size'

class TextStroke extends React.Component {
  constructor (props) {
    super(props)
    this.props = props

    this.state = {
      width: 500,
      height: 500
    }

    this.fontSpecs = {
      fontFamily: this.props.style.fontFamily,
      fontSize: this.props.style.fontSize
    }
  }

  async componentDidMount () {
    const text = this.props.children.join('')
    const size = await rnTextSize.measure({
      text,
      width: 1000,            // max-width of the "virtual" container
      ...this.fontSpecs,     // RN font specification
    })
    this.setState({
      width: size.width,
      height: size.height
    })
  }

  render () {
    return (
      <Svg
        height={this.state.height}
        width={this.state.width}>
        <Text
          fontFamily={this.props.style.fontFamily}
          fontSize={this.props.style.fontSize}
          fill="none"
          stroke={this.props.style.color}
          strokeWidth={2}
          textAnchor="start"
          x="0"
          y={this.props.style.lineHeight}
        >{this.props.children}</Text>
      </Svg>
    )
  }
}

export default TextStroke
