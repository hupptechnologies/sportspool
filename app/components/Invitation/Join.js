import React, { Component } from 'react'
import {
  ScrollView,
  View,
  Image,
  StyleSheet
} from 'react-native'

import { Text } from '../../common/SPText';
import Border from '../../common/Border';
import SPTextFieldInline from '../../common/SPTextFieldInline';
import Markdown from 'react-native-simple-markdown';

export default class InvitationJoinSection extends Component {
  render() {
    const managerName = `${this.props.invitation.pool.manager.name.first} ${this.props.invitation.pool.manager.name.last}`;

    return (
      <ScrollView style={[styles.container, this.props.style]}>
        <View style={styles.managerLabel}>
          <Text styleName="p medium muted">Pool Manager </Text>
          <Text styleName="p medium">{managerName}</Text>
        </View>
        <Border style={styles.border} />
        <Markdown style={styles.description} styles={markdownStyles}>
          {this.props.invitation.pool.description}
        </Markdown>
      </ScrollView>
    )
  }
}

const fontFamily = require('../../env').fontFamily

const markdownStyles = {
  paragraph: {
      fontFamily: fontFamily
    }
}

const styles = StyleSheet.create({
  container: {
    marginTop: -20
  },
  description: {
    marginTop: 15
  },
  managerLabel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  border: {

  }
});
