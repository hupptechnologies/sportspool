import React from 'react';
import { connect } from 'react-redux';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { SPModalHeader, SPModalButton } from '../common/SPModal';
import { Text, SPText, SPMediumText } from '../common/SPText';
import SPButton from '../common/SPButton';
import Border from '../common/Border';
import UserInfo from './User/Info';
import Instabug from 'instabug-reactnative';
import codePush from 'react-native-code-push';

class MenuRowItem extends React.Component {
  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.props.onPress}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 15
          }}>
            <SPMediumText style={{
              color: '#333',
              fontSize: 16
            }}>
              {this.props.title}
            </SPMediumText>
            {this.props.hideArrow ?
              null
            :
              <Image source={require('../common/images/right-chevron.png')} />
            }
          </View>
        </TouchableOpacity>
        <Border />
      </View>
    )
  }
}

class Menu extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <SPModalHeader
          title="Menu"
          style={{ paddingTop: Platform.OS === 'ios' ? 10 : 0 }}
        >
          <UserInfo user={this.props.user} />
        </SPModalHeader>

        <ScrollView>
          <MenuRowItem title="Edit Profile" onPress={() => this.openEditProfile()} />
          {/* <MenuRowItem title="Customize Notifications" onPress={() => this.openNotifications()} /> */}
          <MenuRowItem title="Send Us Feedback" hideArrow={true} onPress={() => this.openInstabug()} />

          {this.hasArchivedEntries() &&
          <MenuRowItem title="My Archived Entries" onPress={() => this.openPastEntries()} />
          }

          <MenuRowItem title="The Fine Print" onPress={() => this.openLegal()} />

          <View style={styles.createContainer}>
            <SPMediumText>Run Your Own Pool</SPMediumText>
            <SPText style={styles.createText}>
              {"Interested in running your own pool?\nCreate a pool and invite friends."}
            </SPText>
            <SPButton style={styles.createButton} title="Create New Pool" onPress={() => this.openCreatePool()} />
          </View>

          <Text styleName="center muted small">
            v2.3.6
          </Text>

          {/* <SPButton
            title="Check for App Update"
            type="small gray"
            style={{ marginHorizontal: 30 }}
            onPress={() => this.checkForAppUpdate()}
          /> */}

        </ScrollView>
      </View>
    )
  }

  checkForAppUpdate() {
    codePush.sync({
      updateDialog: {
        title: "An update is available!"
      },
      installMode: codePush.InstallMode.IMMEDIATE
    });
  }

  hasArchivedEntries() {
    return this.props.entries.filter(entry => entry.archived).length > 0;
  }

  openEditProfile() {
    this.props.navigator.push({
      menu: true,
      editProfile: true
    });
  }

  openPoolInvitations() {

  }

  openNotifications() {
    this.props.navigator.push({
      menu: true,
      notificationSettings: true
    });
  }

  openInstabug() {
    Instabug.invoke();
  }

  openPastEntries() {
    this.props.navigator.push({
      menu: true,
      pastEntries: true
    });
  }

  openLegal() {
    this.props.navigator.push({
      menu: true,
      legal: true
    });
  }

  openCreatePool() {
    this.props.navigator.push({
      menu: true,
      createPool: true
    });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  createContainer: {
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    borderRadius: 6,
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 30
  },
  createText: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  createButton: {
    height: 48
  }
})

export default connect((store) => {
  return store;
})(Menu);
