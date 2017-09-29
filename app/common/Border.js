import React from 'react';
import { View } from 'react-native';
import SPColors from './SPColors';

export default class Border extends React.Component {
  render() {
    return (
      <View style={[{backgroundColor: SPColors.borderColor, height: 1}, this.props.style]} />
    )
  }
}
