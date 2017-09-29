import React, { Component } from 'react'

import {
  View,
  StyleSheet
} from 'react-native'

import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal'

import {
  Text
} from '../../common/SPText'
import InvitationRulesSection from '../Invitation/Rules';
import moment from 'moment';
import _ from 'underscore'

class PoolRules extends Component {

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={
            <SPModalButton icon="ios-close" onPress={() => this.dismiss()} />
          }
          title="Pool Rules"
        >
          <View style={{
            backgroundColor: 'transparent',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 15
          }}>
            <Text styleName="white center h1">
              {this.props.pool.name}
            </Text>
            <Text styleName="center h2 translucent" style={{
              marginTop: 4,
              marginBottom: 8
            }}>
              {this.props.pool.league.name} {this.props.pool.style}
            </Text>

            {moment.utc().isBefore(this.props.pool.entryDeadline) &&
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <Text styleName="white medium">
                  Entries Close
                </Text>
                <Text styleName="translucent">
                  {moment(this.props.pool.entryDeadline).format('h:mm a, ddd MMM D')}
                </Text>
              </View>
            }
          </View>
        </SPModalHeader>
        <SPModalBody>
          <InvitationRulesSection pool={this.props.pool} style={{padding: 20}}/>
        </SPModalBody>
      </SPModal>
    )
  }

  dismiss() {
    this.props.navigator.pop()
  }

}

const styles = StyleSheet.create({

})

export default PoolRules
