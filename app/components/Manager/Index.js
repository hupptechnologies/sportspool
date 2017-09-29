import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ListView,
  ActionSheetIOS,
  Picker,
  TouchableOpacity,
  Clipboard,
  Platform,
  Image
} from 'react-native';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';

import { Text, SPMediumText, SPTextHeading1, SPText } from '../../common/SPText';
import SPButton from '../../common/SPButton';
import SPColors from '../../common/SPColors';
import Border from '../../common/Border';
import LeaderboardBar from '../LeaderboardBar';
import EntryListView from '../EntryListView';
import _ from 'underscore';
import {
  getAllEntries,
  groupEntries,
  changeEntriesStatus
} from '../../actions/manager';
import { getPoolStats } from '../../actions/pool';
import ActivityIndicator from '../ActivityIndicator';
import TabView from '../TabView';
import Search from './Search';
import AndroidPicker from '../AndroidPicker';
import SearchBar from 'react-native-search-bar';
import lunr from 'lunr';
import moment from 'moment';
import Fuse from '../../fuse';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from '../Modals/Modal';

class ManagerScreen extends Component {

  constructor(props) {
    super(props);

    const filterValues = ['Entries', 'Players'];

    this.state = {
      filterValues: filterValues,
      selectedSegmentIndex: 0,
      selectedEntries: [],
      stats: {},
      copyText: props.pool.inviteLink,
      showManagerOptions: false,
      search: "",
      copied: false,
      showSearch: false,
      searchData: {}
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Loading entries...'
    })

    const poolID = this.props.pool._id;
    const token = this.props.auth.token;

    this.props.dispatch(getAllEntries(poolID, token));

    getPoolStats(this.props.pool._id, token)
      .then(stats => this.setState({stats}))
      .catch(error => alert(error.message));
  }

  componentWillReceiveProps(nextProps) {
    // Assume network request has finished if receiving new props
    this.props.dispatch({type: 'HIDE_ACTIVITY_INDICATOR'})
  }

  render() {
        // Manager edited entry names
    var notification = this.props.notifications.filter(n => n.type == 'edited entry names')[0];

    if (notification) {
      return (
        <Modal
          onClose={() => this.props.dispatch({
            type: 'REMOVE_NOTIFICATION',
            id: notification.id
          })}
          title={`${notification.numEntries} Entry ${notification.numEntries == 1 ? 'Name' : 'Names'} Changed`}
          description={`Player: ${notification.player.name.first} ${notification.player.name.last}`}
          body={
            <View>
              <Text styleName="bold dark center">
                The player has been notified.
              </Text>
            </View>
          }
        />
      );
    }


    if (this.state.showSearch) {
      const entries = this.props.manager.entries[this.props.pool._id] || []
      var options = {
        keys: ['name', 'user.name.first', 'user.name.last'],
        threshold: 0.2
      };
      var fuse = new Fuse(entries, options)

      return (
        <Search
          data={this.state.searchData}
          pool={this.props.pool}
          navigator={this.props.navigator}
          dismiss={() => this.setState({ showSearch: false, searchData: {} })}
          entriesForUser={u => this.entriesForUser(u)}
          onSearch={(text) => {
            var entries = fuse.search(text)

            this.setState({
              searchData: {
                'Users': this.mapEntriesToUsers(entries).map(o => {
                  return {
                    ...o,
                    renderAsUser: true
                  }
                }),
                'Entries': entries 
              }
            })
          }}
        />
      )
    };

    return (
      <SPModal>
        <SPModalHeader
          backgroundColor={SPColors.managerColor}
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
          titleComponent={this.titleView()}
          rightComponent={
            <SPModalButton icon="ios-information-circle-outline" onPress={() => this.openManagerOptions()}/>
          }
        >
          {/* {this.state.stats.survivors && moment().isAfter(this.props.pool.entryDeadline) &&
            <LeaderboardBar numSurvivors={this.state.stats.survivors} />
          } */}

          {moment.utc(this.props.pool.entryDeadline).isAfter(moment.utc()) ?
          <View style={{marginVertical:15}}>
            <Text styleName="center translucent">Players with this link can join this pool.</Text>
            <Text styleName="center translucent">Entry deadline is {moment(this.props.pool.entryDeadline).format('dddd, MMMM Do')}</Text>
            <SPButton
              type="small"
              backgroundColor={this.state.copied ? SPColors.managerColor : null}
              title={this.state.copied ? "Copied to clipboard!" : "Copy Pool Link"}
              style={{paddingHorizontal: 30, marginTop: 10}}
              disabled={this.state.copied}
              onPress={() => this.linkCopied()}
            />
          </View>
          :
          <View style={{margin:15}}>
            <Text styleName="center translucent">Entry deadline has passed.</Text>
          </View>
          }
        </SPModalHeader>
        <SPModalBody>
          <TouchableOpacity style={{ padding: 10, marginBottom: -10 }} onPress={() => this.setState({ showSearch: true })}>
            <View style={{ paddingVertical: 5, backgroundColor: '#E6E6E6', borderRadius: 3, flexDirection: 'row', justifyContent: 'center' }}>
              <Icon name="ios-search" color="#A5A4A6" size={18} />
              <Text style={{ color: '#A5A4A6', paddingLeft: 5 }}>Search</Text>
            </View>
          </TouchableOpacity>
          <TabView
            tintColor={SPColors.managerColor}
            selectedIndex={0}
            routes={this.routes()}
            tabs={this.tabs()}
          />
        </SPModalBody>

        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.loadingText}
        />

        {Platform.OS === 'android' &&
          <AndroidPicker
            visible={this.state.showManagerOptions}
            onRequestClose={() => this.hideModal()}
            title="Manager Settings"
            items={[
              {
                key: 0,
                title: 'View Pool Rules',
                onPick: () => {
                  this.hideModal();
                  this.props.navigator.push({
                    poolRules: {},
                    pool: this.props.pool
                  });
                }
              },
              {
                key: 1,
                title: 'Edit Pool Rules',
                onPick: () => {

                  if (this.props.pool.status == 'closed') {
                    alert("Edits cannot be made because this pool has already ended.")
                  } else {
                    this.hideModal();
                    this.props.navigator.push({
                      createPool: true,
                      pool: this.props.pool
                    });
                  }
                }
              },
              {
                key: 2,
                title: 'Open Chat',
                onPick: () => {
                  this.hideModal();
                  this.props.navigator.push({
                    chat: true,
                    pool: this.props.pool
                  });
                }
              }
            ]}
          />
        }
      </SPModal>
    )
  }

  hideModal() {
    this.setState({ showManagerOptions: false });
  }

  linkCopied() {
    const link = this.props.pool.inviteLink;

    Clipboard.setString(link);

    this.setState({
      copied: true
    });

    setTimeout(() => {
      this.setState({
        copied: false
      });
    }, 3000);
  }

  tabs() {
    return [
      'Entries',
      'Players'
    ]
  }

  routes() {
    var routes = [];
    const entries = this.props.manager.entries[this.props.pool._id] || []

    routes.push(
      <EntryListView
        pool={this.props.pool}
        data={groupEntries(this.sortByEntries(entries))}
        renderAsUser={false}
        navigator={this.props.navigator}
        entriesForUser={u => this.entriesForUser(u)}
        onEntryStatusChange={() => this.showActivityIndicator()}
      />
    )

    const users = this.mapEntriesToUsers(entries);

    routes.push(
      <EntryListView
        pool={this.props.pool}
        data={{ 'Players': users }}
        renderAsUser={true}
        navigator={this.props.navigator}
        entriesForUser={u => this.entriesForUser(u)}
        onEntryStatusChange={() => this.showActivityIndicator()}
      />
    )

    return routes;
  }

  mapEntriesToUsers(entries) {
    return _.chain(this.sortByUser(entries)).groupBy(e => e.user._id).map((val, key) => {
     var user = {...val[0].user};
     user.entries = val;
     user.missedCut = _.reduce(val, (m,e) => m+e.missedCut, 0)
     return user;
   }).value();
  }

  sortByEntries(entries) {
    return _.sortBy(entries, entry => {
      return entry.name.toLowerCase();
    });
  }

  sortByUser(entries) {
    return _.sortBy(entries, entry => {
      if (entry.user == null) {
        console.log(entry)
      }
      return `${entry.user.name.first} ${entry.user.name.last}`;
    });
  }

  entriesForUser(user) {
    const entries = this.props.manager.entries[this.props.pool._id] || [];
    return entries.filter(entry => {
      return entry.user._id == user._id
    })
  }

  showActivityIndicator() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Updating entries...'
    });
  }

  titleView() {
    return (
      <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
        <SPMediumText style={{color: 'white'}} numberOfLines={1}>
          {this.props.pool.name}
        </SPMediumText>
        <Text styleName="translucent">
          Round {this.props.pool.currentRoundIndex + 1} of {this.props.pool.league.name == 'PGA' ? 4 : this.props.pool.rounds.length}
        </Text>
      </View>
    )
  }

  isPoolClosed() {
    return this.props.pool.status == 'closed';
  }

  shouldShowNoPendingEntriesView() {
    const entries = this.props.manager.entries[this.props.pool._id] || [];
    return this.state.selectedSegmentIndex == 0 && !this.isPoolClosed() && entries.filter(e => e.poolStatus == 'pending').length == 0;
  }

  openManagerOptions() {
    if (Platform.OS === 'android') {
      this.setState({
        showManagerOptions: true
      });

      return;
    }

    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Cancel', 'Chat', 'View Pool Rules', 'Edit Pool Rules'],
      cancelButtonIndex: 0
    }, (buttonIndex) => {
      if (buttonIndex == 1) {
        this.props.navigator.push({
          chat: true,
          pool: this.props.pool
        });
      } else if (buttonIndex == 2) {
        this.props.navigator.push({
          poolRules: {},
          pool: this.props.pool
        });
      } else if (buttonIndex == 3) {
        if (this.props.pool.status == 'closed') {
          alert("Edits cannot be made because this pool has already ended.")
        } else {
          this.props.navigator.push({
            createPool: true,
            pool: this.props.pool
          });
        }
      }
    });
  }

  openShare() {
    if (Platform.OS === 'android') {
      return;
    }

    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.props.pool.inviteLink
    }, (err) => alert(err.message), (success, method) => {

    });
  }

  dismiss() {
    this.props.navigator.pop();
  }
}

const styles = StyleSheet.create({

});

export default connect((store) => {
  return store;
})(ManagerScreen);
