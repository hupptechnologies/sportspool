import React, { Component } from 'react'
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity
} from 'react-native'

import { SPText } from '../../common/SPText'
import SPButton from '../../common/SPButton'

export default class InvitationAddEntriesSection extends Component {

  maxEntriesPerUser() {
    return this.props.invitation.pool.maxEntriesPerUser;
  }

  reachedMaximumEntries() {
    // Unlimited
    if (this.maxEntriesPerUser() < 0) {
      return false;
    }

    return this.props.numberOfEntries >= this.maxEntriesPerUser();
  }

  render() {
    return (
      <View>
        <View style={{
          backgroundColor: '#F6F6F6',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 6,
          paddingLeft: 20,
          marginBottom: 10
        }}>
          <SPText style={{fontWeight: '500', fontSize: 14}}>
            Number of Entries
          </SPText>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <TouchableOpacity
              accessibilityTrait="button"
              style={{
                width: 60,
                height: 60,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={this.props.onSubtract}
            >
              <Image
                source={require("../../common/images/icon-subtract.png")}
                style={{
                  opacity: this.props.numberOfEntries > 1 ? 1.0 : 0.0
                }}
              />
            </TouchableOpacity>

            <SPText style={{
              fontWeight: '900',
              fontSize: 20,
              paddingHorizontal: 10
            }}>
              {this.props.numberOfEntries}
            </SPText>

            <TouchableOpacity
              accessibilityTrait="button"
              style={{
                width: 60,
                height: 60,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={this.props.onAdd}
            >
              <Image
                source={require("../../common/images/icon-add.png")}
                style={{
                  opacity: this.reachedMaximumEntries() ? 0.0 : 1.0
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <SPButton title="Add Entries" onPress={this.props.onSubmit} />
      </View>
    )
  }
}
