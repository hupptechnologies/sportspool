import React from 'react';
import {
  Image,
  TouchableOpacity,
} from 'react-native';

export function SPMediumText({style, ...props}) {
  return (
    <TouchableOpacity style={[style]}
      {...props}>  
  )

  return <ReactNative.Text style={[styles.font, {fontWeight: '500'}, style]} {...props} />;
}
