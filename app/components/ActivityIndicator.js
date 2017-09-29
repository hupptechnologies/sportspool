
import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Text } from '../common/SPText';

export default class SPActivityIndicator extends Component {

  render() {
    if (!this.props.animate) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.overlay}>
          <ActivityIndicator
            style={styles.indicator}
            animating={true}
            size="small"
            color="white"
          />
          <Text styleName="white medium">
            {this.props.text}
          </Text>
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 5
  },
  indicator: {
    height: 20,
    width: 20,
    paddingRight: 15
  },
  text: {

  }
});
