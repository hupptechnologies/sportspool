import React, { Component } from 'react';

import {
  View,
  Image,
  StyleSheet,
  ListView
} from 'react-native';

import {
  Text,
  SPMediumText
} from '../../common/SPText';

export default class UserInfo extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.name}>
            {`${this.props.user.name.first} ${this.props.user.name.last}`}
          </Text>
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'transparent'
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 15
  },
  name: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4
  },
  contactInfo: {
    fontSize: 16,
    marginVertical: 1
  }
})
