import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import SPColors from './SPColors';

class SPButton extends Component {
  render() {
    var attrs = this.props.type || '';
    attrs = attrs.split(' ');
    const titleSize = ~attrs.indexOf("small") ? 14 : 18;
    const horizontalPadding = ~attrs.indexOf('small') ? 0 : 40;
    const color = ~attrs.indexOf("gray") ? '#BBBBBB' : this.props.backgroundColor ? this.props.backgroundColor : SPColors.primaryButtonColor;

    const content = (
      <View style={[styles.button, styles.primaryButton, {backgroundColor:color, paddingHorizontal:horizontalPadding}]}>
        <Text style={[styles.title, {fontSize:titleSize}]}>{this.props.title}</Text>
      </View>
    );

    return (
      <TouchableOpacity
        {...this.props}
        accessibilityTrait="button"
        onPress={this.props.onPress}
        style={[styles.container, this.props.style]}
        >
        {content}
      </TouchableOpacity>
    )
  }
}

const HEIGHT = 48;

const styles = StyleSheet.create({
  container: {
    height: HEIGHT
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6
  },
  primaryButton: {
    backgroundColor: SPColors.primaryButtonColor
  },
  title: {
    color: 'white',
    fontFamily: require('../env').fontFamily,
    fontWeight: 'bold'
  }
});

export default SPButton;
