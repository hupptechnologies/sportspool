import React from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform
} from 'react-native';

import { SPModal, SPModalHeader, SPModalBody, SPModalFooter, SPModalButton } from '../../common/SPModal';
import { Text, SPText, SPMediumText, SPTextHeading1, SPTextHeading2 } from '../../common/SPText';
import SPInlineInfoLabel from '../../common/SPInlineInfoLabel';
import InvitationRulesSection from '../Invitation/Rules';
import InvitationJoinSection from '../Invitation/Join';
import InvitationAddEntriesSection from '../Invitation/AddEntries';
import moment from 'moment';
import TabView from '../TabView';
import { declineInvitation } from '../../actions/invitations';
import AndroidPicker from '../AndroidPicker';

const BUTTONS = [
  'Decide Later',
  'Decline Invitation',
  'Cancel',
];
const DESTRUCTIVE_INDEX = 1;
const CANCEL_INDEX = 2;

class PoolInvitationView extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      numberOfEntries: 1,
      selectedIndex: 0,
      showAndroidPicker: false
    }
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
          title="Pool Invitation"
        >
          <View style={styles.topContent}>
            <Text styleName="white h2 center" style={{color: 'white', textAlign: 'center'}}>
              {this.props.invitation.pool.name}
            </Text>
            <SPTextHeading2 style={{
              color: '#B8D0EA',
              textAlign: 'center',
              marginTop: 4,
              marginBottom: 8
            }}>
              {this.props.invitation.pool.league.name} {this.props.invitation.pool.style}
            </SPTextHeading2>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <SPMediumText style={{
                color: 'white'
              }}>
                Entries Close
              </SPMediumText>
              <SPText style={{
                color: '#B8D0EA'
              }}>
                {moment(this.props.invitation.pool.entryDeadline).format('h:mm a, ddd MMM D')}
              </SPText>
            </View>
          </View>
        </SPModalHeader>
        <SPModalBody>

          <TabView
            tabs={['Invitation', 'Rules']}
            routes={[
              <InvitationJoinSection style={{padding:20}} invitation={this.props.invitation} />,
              <InvitationRulesSection style={{padding: 20}} pool={this.props.invitation.pool} />
            ]}
            onTabSelect={(index) => {this.setState({selectedIndex:index})}}
          />

        </SPModalBody>
        {this.state.selectedIndex == 0 && !this.props.disableEntrySelection &&
        <SPModalFooter>
          <InvitationAddEntriesSection
            invitation={this.props.invitation}
            numberOfEntries={this.state.numberOfEntries}
            onSubtract={() => this.decrementEntries()}
            onAdd={() => this.incrementEntries()}
            onSubmit={() => this.showConfirmEntries()}
          />
        </SPModalFooter>
      }

      {Platform.OS === 'android' &&
        <AndroidPicker
          visible={this.state.showAndroidPicker}
          onRequestClose={() => this.setState({ showAndroidPicker: false })}
          title="Invitation Options"
          items={[
            {
              key: 0,
              title: BUTTONS[0],
              onPick: () => {
                this.props.navigator.pop()
              }
            },
            {
              key: 1,
              title: BUTTONS[1],
              onPick: () => {
                this.props.navigator.pop()
                this.declineInvitation()
              }
            }
          ]}
        />
      }
      </SPModal>
    )
  }

  incrementEntries() {
    var count = this.state.numberOfEntries + 1

    if (this.props.invitation.pool.maxEntriesPerUser >= 0) {
      count = Math.min(count, this.props.invitation.pool.maxEntriesPerUser)
    }

    this.setState({
      numberOfEntries: count
    })
  }

  decrementEntries() {
    const count = Math.max(this.state.numberOfEntries - 1, 1)
    this.setState({
      numberOfEntries: count
    })
  }

  dismiss() {
    this.props.navigator.pop();
  }

  declineInvitation() {
    const token = this.props.auth.token;
    const invitation = this.props.invitation;
    this.props.dispatch(declineInvitation(invitation, token));
  }

  showConfirmEntries() {
    this.props.navigator.push({
      invitation: this.props.invitation,
      numberOfEntries: this.state.numberOfEntries,
      pool: this.props.pool,
      player: this.props.player
    })
  }
}

const styles = StyleSheet.create({
  leftAlign: {
    textAlign: 'left'
  },
  leftItem: {

  },
  topContent: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15
  },
  bottomContent: {
    backgroundColor: 'white',
    padding: 20,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 15
  }
})

export default connect(store => store)(PoolInvitationView);
