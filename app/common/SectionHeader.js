import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SPMediumText, SPText } from './SPText';
import Icon from 'react-native-vector-icons/Ionicons';

export default class SectionHeader extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <View style={styles.container}>
          <SPMediumText style={styles.leftLabel}>
            {this.props.leftLabel}
          </SPMediumText>
          <SPText style={styles.rightLabel}>
            {this.props.rightLabel}
          </SPText>
          {this.props.arrow &&
            <Icon name={this.props.arrow} color="#333333" size={20} />
          }
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E6E8F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20
  },
  leftLabel: {
    fontSize: 14,
    color: '#333'
  },
  rightLabel: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right'
  }
});
