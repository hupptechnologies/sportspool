import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SPColors from './SPColors';

class SPGradientBackground extends Component {
  render() {
    return (
      <LinearGradient start={[0,0]} end={[1,1]} colors={['#3B9ACA', '#283D81']} style={[this.style]}>
            {this.props.children}
      </LinearGradient>
    )
  }
}

export default SPGradientBackground;
