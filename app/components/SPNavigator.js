import React, { Component } from 'react';
import {
  DeviceEventEmitter,
  Navigator,
  StyleSheet,
  Platform,
  View,
  Text
} from 'react-native';
import { connect } from 'react-redux';

import EntriesScreen from './Entries/EntriesScreen';
import EntryView from './Entries/EntryView';
import PGAEntryView from './Entries/PGAEntryView';
import SneakPeek from './Entries/SneakPeek';
import EditEntryNames from './Entries/EditEntryNames';
import PoolInvitationView from './Invitation/Index';
import ConfirmEntriesView from './Invitation/Confirm';
import PoolRules from './Pool/Rules';
import PoolOverview from './Pool/Overview';
import Chat from './Chat/Index';
import ChatConversations from './Chat/Conversations';
import DirectMessage from './Chat/DirectMessage';
import ManagerScreen from './Manager/Index';
import UserProfileView from './User/Profile';
import NotificationSettings from './Menu/Notifications';
import TheFinePrint from './Menu/Legal';
import PastEntries from './Menu/PastEntries';
import EditProfile from './Menu/EditProfile';
import CreatePool from './Pool/Create';
import _ from 'underscore';

class SPNavigator extends Component {

  render() {
    return (
      <Navigator
        ref="navigator"
        style={styles.container}
        configureScene={(route) => {
          if (Platform.OS === 'android') {
            return Navigator.SceneConfigs.FloatFromBottomAndroid;
          }

          return Navigator.SceneConfigs.FloatFromBottom;
        }}
        initialRoute={{}}
        renderScene={this.renderScene}
      />
    )
  }

  componentWillReceiveProps(nextProps) {
    DeviceEventEmitter.emit('ChatConversations', nextProps.threads);
    DeviceEventEmitter.emit('CustomizeNotifications', nextProps.notificationSettings);
    DeviceEventEmitter.emit('EditProfile', nextProps.user);
    DeviceEventEmitter.emit('UserProfile', nextProps);
  }

  renderScene(route, navigator) {
    if (route.type == 'edit entry names') {
      return (
        <EditEntryNames {...route} />
      )
    }

    if (route.sneakPeek) {
      return (
        <SneakPeek navigator={navigator} entry={route.entry} pool={route.pool} />
      )
    }

    if (route.directMessage) {
      return (
        <DirectMessage {...route} navigator={navigator} />
      )
    }

    if (route.createPool) {
      return (
        <CreatePool navigator={navigator} pool={route.pool} />
      )
    }

    // Menu routes
    if (route.menu) {
      if (route.editProfile) {
        return <EditProfile navigator={navigator} />
      }

      if (route.invitations) {
        // TODO: View all pool invitations
      }

      if (route.notificationSettings) {
        return <NotificationSettings navigator={navigator} />
      }

      if (route.legal) {
        return <TheFinePrint navigator={navigator} />
      }

      if (route.pastEntries) {
        return <PastEntries navigator={navigator} />
      }
    }

    if (route.entry) {
      if (route.entry.pool.style == 'Best 5 of 10') {
        return (
          <PGAEntryView entry={route.entry} navigator={navigator} />
        )
      }

      return (
        <EntryView {...route} navigator={navigator} />
      )
    }

    if (route.user && route.pool) {
      return (
        <UserProfileView user={route.user} pool={route.pool} navigator={navigator} />
      )
    }

    if (route.poolRules) {
      return (
        <PoolRules navigator={navigator} pool={route.pool} />
      )
    }

    if (route.manager && route.pool) {
      return (
        <ManagerScreen pool={route.pool} navigator={navigator} />
      );
    }

    if (route.chat) {
      if (route.pool) {
        return (
          <ChatConversations navigator={navigator} pool={route.pool} />
        )
      }

      return (
        <Chat navigator={navigator} />
      )
    }

    if (route.pool) {
      return (
        <PoolOverview pool={route.pool} navigator={navigator} myEntries={route.entries} />
      )
    }

    if (route.numberOfEntries) {
      return (
        <ConfirmEntriesView
          invitation={route.invitation}
          numberOfEntries={route.numberOfEntries}
          navigator={navigator}
          player={route.player}
        />
      )
    }

    if (route.invitation) {
      return (
        <PoolInvitationView {...route} navigator={navigator} />
      )
    }

    return (
      <EntriesScreen navigator={navigator} />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
})

export default connect((store) => {
  return store
})(SPNavigator)
