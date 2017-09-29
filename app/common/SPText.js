import React from 'react';
import ReactNative, {StyleSheet, Dimensions} from 'react-native';
import SPColors from './SPColors';

export function Text({style, ...props}) {
  var textStyles = {
    fontFamily: require('../env').fontFamily
  };

  if (props.styleName) {
    props.styleName.split(' ').forEach(name => {
      if (styles[name]) {
        textStyles = {...textStyles, ...styles[name]};
      }
    })
  }

  return <ReactNative.Text style={[textStyles, style]} {...props} />
}

export function SPText({style, ...props}) {
  return <ReactNative.Text style={[sheet.font, style]} {...props} />;
}

export function SPMediumText({style, ...props}) {
  return <ReactNative.Text style={[sheet.font, {fontWeight: '500'}, style]} {...props} />;
}

export function SPBoldText({style, ...props}) {
  return <ReactNative.Text style={[sheet.font, {fontWeight: 'bold'}, style]} {...props} />;
}

export function SPTextHeading1({style, ...props}) {
  return <ReactNative.Text style={[sheet.font, sheet.h1, style]} {...props} />;
}

export function SPTextHeading2({style, ...props}) {
  return <ReactNative.Text style={[sheet.font, sheet.h2, style]} {...props} />;
}

export function SPTextParagraph({style, ...props}) {
  return <ReactNative.Text style={[sheet.font, sheet.p, style]} {...props} />;
}

const scale = Dimensions.get('window').width / 375;

function normalize(size: number): number {
  return Math.round(scale * size);
}

const styles = {
  font: {
    fontFamily: require('../env').fontFamily
  },
  h1: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: 'bold'
  },
  h2: {
    fontSize: 18,
    lineHeight: 25
  },
  h3: {
    fontSize: 16,
  },
  p: {
    fontSize: 15,
    lineHeight: 23
  },
  bold: {
    fontWeight: 'bold'
  },
  medium: {
    fontWeight: '500'
  },
  dark: {
    color: '#333'
  },
  white: {
    color: 'white'
  },
  muted: {
    color: '#999'
  },
  center: {
    textAlign: 'center'
  },
  translucent: {
    color: 'rgba(255, 255, 255, 0.6)'
  },
  link: {
    color: SPColors.primaryButtonColor
  },
  small: {
    fontSize: 12,
  }
};
const sheet = StyleSheet.create(styles);
