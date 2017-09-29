import React from 'react'
import {
  StyleSheet,
  View
} from 'react-native'

import { SPMediumText } from './SPText'
import Border from './Border'

export default class SPInlineInfoLabel extends React.Component {
  render() {
    return (
      <View style={this.props.style}>
        <View style={styles.textContainer}>
          <SPMediumText style={styles.leftLabel}>
            {this.props.leftLabel}
          </SPMediumText>
          <SPMediumText style={styles.rightLabel}>
            {this.props.rightLabel}
          </SPMediumText>
        </View>
        <Border/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  leftLabel: {
    color: '#999',
    fontSize: 14
  },
  rightLabel: {
    color: '#333',
    fontSize: 14
  }
})
