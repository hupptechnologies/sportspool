import React from 'react'
import {
  View,
  StyleSheet
} from 'react-native'

import SPButton from '../../common/SPButton'
import { SPTextHeading1, SPTextHeading2, SPBoldText, SPText } from '../../common/SPText'
import moment from 'moment'

class PoolInvitationSnapshotView extends React.Component {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <SPTextHeading1 style={styles.heading1}>{this.props.invitation.pool.name}</SPTextHeading1>
        <SPTextHeading2 style={styles.heading2}>
          {this.props.invitation.pool.league.name} {this.props.invitation.pool.style}
        </SPTextHeading2>
        <View style={styles.close}>
          <SPBoldText>Entries Close</SPBoldText>
          <SPText style={{color: '#999'}}>
            {moment(this.props.invitation.pool.entryDeadline).format('h:mm a, ddd MMM D')}
          </SPText>
        </View>
        <SPButton
          onPress={this.props.onPress}
          title="View Invitation" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    margin: 20,
    padding: 20,
    borderRadius: 6,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.23,
    shadowRadius: 6
  },
  heading1: {
    textAlign: 'center'
  },
  heading2: {
    textAlign: 'center',
    color: '#999',
    marginTop: 4,
    marginBottom: 8
  },
  close: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18
  }
})

export default PoolInvitationSnapshotView
