import React from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  RefreshControl,
  ListView,
  View,
  ScrollView,
  Dimensions,
  Image,
  Clipboard
} from 'react-native';

import SectionHeader from '../common/SectionHeader';
import { Text } from '../common/SPText';
import SPButton from '../common/SPButton';
import SPColors from '../common/SPColors';
import EntryItemView from './Entries/EntryItemView';
import PoolInvitationSnapshotView from './Invitation/Snapshot';
import { generateInvitation } from '../actions/invitations';
import moment from 'moment';
import _ from 'lodash';
import FindInvitationView from './Invitation/FindInvitationView';
import ActivityIndicator from './ActivityIndicator';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';

class InvitationList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }),
      refreshing: false
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.props.invitations),
      refreshing: false
    });
  }

  onRefresh() {
    this.setState({ refreshing: true });
  }

  render() {
    return (
      <ListView
          style={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.onRefresh()}
            />
          }
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          renderRow={(e) => {
            return <PoolInvitationSnapshotView
                style={styles.invitation}
                invitation={e}
                onPress={() => this.props.onInvitationPress(e)} />
          }}
          renderFooter={() => <FindInvitationView />}
        />
    );
  }
}

class PlayerMode extends React.Component {
  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    });

    this.state = {
      refreshing: false,
      activeEntries: dataSource,
      pastEntries: dataSource,
      showFindInvitation: false,
      index: 1,
      routes: [
        { key: '1', title: 'Invitations' },
        { key: '2', title: 'Active Entries' },
        { key: '3', title: 'Past Entries' }
      ]
    };
  }

  componentWillReceiveProps(props) {
    const [active, past] = _.partition(this.props.entries, ['pool.status', 'open'])
      .map(this.mapEntriesToDataBlob);

    this.setState({
      activeEntries: this.state.activeEntries.cloneWithRowsAndSections(active),
      pastEntries: this.state.pastEntries.cloneWithRowsAndSections(past),
      refreshing: false
    });
  }

  _handleChangeTab = (index) => this.setState({ index });
  _renderHeader = (props) => {
    return <TabBar
        {...props}
        renderLabel={(scene) => {
          return <Text
              style={{marginLeft: 10}}
              styleName='h3 white'
            >
            {scene.route.title}
          </Text>
        }}
        style={{backgroundColor: SPColors.playerColor}}
      />;
  };
  _renderScene = ({route}) => {
    switch (route.key) {
      case '1':
        return <InvitationList
            invitations={this.props.pendingInvitations}
            onInvitationPress={(e) => this.props.onInvitationPress(e)}
          />
      case '2':
      case '3':
        const source = route.key === '2' && this.state.activeEntries || this.state.pastEntries;

        return (
          <ListView
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this.onRefresh()}
              />
            }
            dataSource={source}
            enableEmptySections={true}
            renderSectionHeader={(e) => {
              var leagueName = _.values(e)[0].pool.league.name;
              return <SectionHeader
                leftLabel={`${leagueName == 'PGA' ? "⛳️" : leagueName == 'NFL' ? "🏈" : "🏀"} ${_.values(e)[0].pool.name}`}
                rightLabel={""}
              />
            }}
            renderRow={(entry) => {
              if (entry.canAddEntries) {
                return this.poolInfoView(entry.pool)
              } else {
                return (
                  <EntryItemView
                    key={entry.id}
                    entry={entry}
                    onPress={() => this.props.onEntryPress(entry)}
                    />
                );
              }
            }}
          />
        )
    }
  }

  render() {
    return (
      <TabViewAnimated
        style={styles.container}
        navigationState={this.state}
        renderScene={this._renderScene}
        renderHeader={this._renderHeader}
        onRequestChangeTab={this._handleChangeTab}
      />
    );
  }

  // Create object where the keys are pool IDs and the values are an object
  // where the keys are the entry ID and value is the entry object.
  //
  // This allows working with ListView component to be easier.
  mapEntriesToDataBlob(entries) {
    var array = entries;
    // Filter out rejected entries
    array = entries.filter(entry => entry.poolStatus !== 'rejected');

    array = _.sortBy(array, 'created').reverse();

    // Creates an object where the keys are pool IDs and values are an array
    // of entries.
    var grouped = _.groupBy(array, 'pool._id')

    var data = {};
    Object.keys(grouped).forEach((poolID) => {
      var entries = grouped[poolID];
      const pool = entries[0].pool;

      data[poolID] = _.sortBy(entries.concat({
        canAddEntries: true,
        pool: pool
      }), 'name');

    });

    return data;
  }

  linkCopied(link) {
    Clipboard.setString(link);

    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Copied link!'
    });

    setTimeout(() => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
    }, 2000);

  }

  onRefresh() {
    this.setState({
      refreshing: true
    });

    this.props.onRefresh();
  }

  generateInvitation(pool, disableEntrySelection) {
    const token = this.props.auth.token;
    generateInvitation(pool, token).then(json => {
      this.props.onInvitationPress(json.invitation, {
        disableDismissOptions: true,
        disableEntrySelection
      });
    }).catch(err => alert(err.message))
  }

  poolInfoView(pool) {
    // Determine if user can add entries to existing pools
    var pastDeadline = moment.utc().isSameOrAfter(pool.entryDeadline);
    var jsx = (
      <View>
        {!pastDeadline &&
          <Text styleName="center bold">Entries close {moment(pool.entryDeadline).fromNow()}</Text>
        }
        <View style={styles.poolInfoButtonContainer}>
          {!pastDeadline &&
            <SPButton type="small gray" title="Invite Others" style={{
              paddingHorizontal: 5,
              flexGrow: 1
            }} onPress={() => this.linkCopied(pool.inviteLink)} />
          }
          <SPButton type="small gray" title={pastDeadline ? "Pool Rules & Info" : "Add Entries & Pool Info"} style={{
            paddingHorizontal: 5,
            flexGrow: 1
          }} onPress={() => this.generateInvitation(pool, pastDeadline) } />
        </View>
      </View>
    )

    return (
      <View style={styles.poolInfoContainer}>
        {jsx}
        <SPButton
          type="small"
          title={pool.league.name == 'PGA' ? "View Leaderboard" : "Pool Overview"}
          style={{ paddingHorizontal: 5, marginTop: 10, marginBottom: -5 }}
          onPress={() => this.props.onPoolOverviewPress(pool)}
        />
      </View>
    );
  }

  openFindInvitation() {
    this.setState({
      showFindInvitation: true
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  invitation: {
    width: Dimensions.get('window').width - 40
  },
  poolInfoContainer: {
    margin: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: '#F6F6F6',
    borderRadius: 6
  },
  poolInfoButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15
  },
  findInvitationContainer: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.23,
    shadowRadius: 6,
    height: 88
  },
  findInvitation: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30
  }
});

export default connect(store => store)(PlayerMode);
