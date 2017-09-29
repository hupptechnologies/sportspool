import React from 'react';
import {
  View,
  ListView,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
  Platform,
  ViewPagerAndroid,
  TouchableOpacity,
  Button,
  Image,
  RefreshControl,
  Dimensions
} from 'react-native'
import { connect } from 'react-redux';
import _ from 'underscore';
import { SPModalHeader, SPModalButton } from '../../common/SPModal';
import SPButton from '../../common/SPButton';
import SPColors from '../../common/SPColors';
import { Text } from '../../common/SPText';
import PoolInvitationSnapshotView from '../Invitation/Snapshot';
import EntryItemView from './EntryItemView';
import SectionHeader from '../../common/SectionHeader';

import Border from '../../common/Border';
import Menu from '../Menu';
import Drawer from 'react-native-drawer';
import CreatePoolModal from '../Modals/PoolCreated';
import Modal from '../Modals/Modal';
import TabView from '../TabView';
import moment from 'moment';

import { getEntries } from '../../actions/entries';
import { getPools, getPoolStats } from '../../actions/pool';
import { getInvitations, registerInvite, generateInvitation } from '../../actions/invitations';

import PushNotificationsHandler from 'react-native-push-notification';

import PlayerMode from '../PlayerMode';
import ManagerMode from '../ManagerMode';
import ActivityIndicator from '../ActivityIndicator';

class EntriesScreen extends React.Component {

  constructor(props) {
    super(props)

    const actionNeeded = _.some(this.props.poolStats, stats => stats.poolStatusPending > 0);
    this.state = {
      selectedMode: 0,
      newPool: undefined,
      refreshing: false,
      tabTitles: [
        'Player Mode',
        `Manager Mode${actionNeeded && ' 🔴' || ''}`
      ]
    };
  }

  componentWillMount() {
    this.setState({
      propsSubscriber: DeviceEventEmitter.addListener('new pool added', (newPool) => {
        this._drawer.close();
        this.setState({selectedMode: 1, newPool});
      })
    });
  }

  componentDidMount() {
    // Register invitation links waiting to submission
    const token = this.props.auth.token;
    const links = this.props.invitations.waitingSubmission;

    this.props.dispatch(registerInvite(token, links));

    this.refreshPlayerMode();
    this.refreshManagerMode();

    PushNotificationsHandler.requestPermissions()
  }

  componentWillUnmount() {
    this.state.propsSubscriber.remove();
  }

  render() {
    if (this.state.newPool !== undefined) {
      return (
        <CreatePoolModal
          pool={this.state.newPool}
          onClose={() => this.setState({newPool:undefined})}
        />
      );
    }

    const entrySubmittedNotification = this.props.notifications.filter(n => n.type == 'entries submitted')[0];
    if (entrySubmittedNotification) {
      return (
        <Modal
          onClose={() => this.props.dispatch({
            type: 'REMOVE_NOTIFICATION',
            id: entrySubmittedNotification.id
          })}
          title={`${entrySubmittedNotification.numEntries} ${entrySubmittedNotification.numEntries == 1 ? 'Entry' : 'Entries'} Submitted`}
          description={`${entrySubmittedNotification.pool.name}`}
          body={
            <View>
              <Text styleName="bold dark center">
                The pool manager has been notified.
              </Text>
              <Text styleName="dark center">
                When the pool manager activates your entries you will receive a notification, and can then make picks.
              </Text>
            </View>
          }
        />
      );
    }

    var notification = this.props.notifications.filter(n => n.type == 'manager submitted entries')[0];
    if (notification) {
      return (
        <Modal
          onClose={() => this.props.dispatch({
            type: 'REMOVE_NOTIFICATION',
            id: notification.id
          })}
          title={`${notification.numEntries} ${notification.numEntries == 1 ? 'Entry' : 'Entries'} Submitted`}
          description={`for ${notification.player.name.first} ${notification.player.name.last}`}
          body={
            <View>
              <Text styleName="bold dark center">
                The player has been notified.
              </Text>
              <Text styleName="dark center">
                You (the pool manager) must activate the entries before the player can make picks.
              </Text>
            </View>
          }
        />
      );
    }

    return (
      <Drawer
        ref={(ref) => this._drawer = ref}
        type="overlay"
        tapToClose={true}
        openDrawerOffset={0.1} // 20% gap on the right side of drawer
        panCloseMask={0.2}
        closedDrawerOffset={-3}
        style={{ shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3}}
        tweenHandler={(ratio) => ({
          main: { opacity:(2-ratio)/2 }
        })}
        content={<Menu navigator={this.props.navigator} />}
      >

        <View style={styles.container}>
          <SPModalHeader
            titleComponent={<Image resizeMode={"contain"} style={styles.image} source={require('../../common/images/logo.png')} />}
            leftComponent={<SPModalButton icon="ios-menu-outline" onPress={() => this._drawer.open()} />}
            rightComponent={<SPModalButton icon="ios-chatbubbles-outline" onPress={() => this.openChat()} />}
            backgroundColor={this.state.selectedMode == 0 ? SPColors.playerColor : SPColors.managerColor}
            style={{ paddingTop: Platform.OS === 'ios' ? 10 : 0 }}
          />

          <TabView
            selectedIndex={this.state.selectedMode}
            onTabSelect={(selectedMode) => this.selectedTab(selectedMode)}
            tabs={this.state.tabTitles}
            backgroundColor={this.state.selectedMode == 0 ? SPColors.playerColor : SPColors.managerColor}
            tintColor={'white'}
            routes={[
              <PlayerMode
                onRefresh={() => this.refreshPlayerMode()}
                onEntryPress={(entry) => {
                  this.openEntry(entry);
                }}
                onPoolOverviewPress={(pool) => {
                  this.openPoolOverview(pool);
                }}
                pendingInvitations={this.props.invitations.all.filter(invitation => {
                  return invitation.status === 'pending' && moment(invitation.pool.entryDeadline).isAfter()
                })}
                onInvitationPress={(invitation, options) => {
                  this.openInvitation(invitation, options);
                }}
              />
              ,
              <ManagerMode
                onRefresh={() => this.refreshManagerMode()}
                onCreatePoolPress={() => {
                  this.openCreatePool();
                }}
                onManagerPoolPress={(pool) => {
                  this.openManagerPool(pool)
                }}
              />
            ]}
          />

        </View>
        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.text}
        />
      </Drawer>
    )
  }

  selectedTab(selectedMode) {
    this.setState({ selectedMode });

    if (selectedMode == 0) {
      this.refreshPlayerMode();
    } else {
      this.refreshManagerMode();
    }
  }

  refreshPlayerMode() {
    const token = this.props.auth.token;
    this.props.dispatch(getEntries(token));
    this.props.dispatch(getInvitations(token));
  }

  refreshManagerMode() {
    const token = this.props.auth.token;
    
    getPools(token).then(json => {
      this.props.dispatch({
        type: 'SET_POOLS', pools: json.data
      });

      json.data.filter(pool => {
        pool.status == 'open'
      }).forEach(pool => {
        var poolId = pool._id
        getPoolStats(poolId).then(stats => {
          this.props.dispatch({
            stats,
            poolId,
            type: 'UPDATE_POOL_STATS'
          })
        })
      })
    })

  }

  openInvitation(invitation, options) {
    this.props.navigator.push({
      invitation,
      ...options
    })
  }

  openEntry(entry) {
    this.props.navigator.push({
      entry
    })
  }

  openPoolOverview(pool) {
    this.props.navigator.push({
      pool,
      entries: this.props.entries || []
    })
  }

  openManagerPool(pool) {
    this.props.navigator.push({
      manager: true,
      pool
    })
  }

  openCreatePool() {
    this.props.navigator.push({
      menu: true,
      createPool: true
    });
  }

  openChat() {
    this.props.navigator.push({
      chat: true
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  },
  viewPager: {
    backgroundColor: 'white',
    flex: 1
  },
  page: {
    flex: 1
  },
  image: {
    width: 57.6,
    height: 34.8
  }
})

const select = (store) => {
  return store;
}

export default connect(select)(EntriesScreen);
