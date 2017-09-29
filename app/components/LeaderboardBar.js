import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SPBoldText, SPText } from '../common/SPText';

export default class LeaderboardBar extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.fill} />
        <View>
          <Text style={styles.count} styleName="center bold">
            {this.props.numSurvivors}
          </Text>
          <Text style={styles.label} styleName="white center">
            Survivors
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: '#222653',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fill: {
    height: 40,
    backgroundColor: '#283D81',
    position: 'absolute'
  },
  count: {
    color: 'white',
    fontSize: 15
  },
  label: {
    fontSize: 12,
    marginTop: -2
  }
});
