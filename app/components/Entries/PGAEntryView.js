import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ListView,
  ActionSheetIOS,
  TouchableOpacity,
  BackAndroid,
  Platform,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';

import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal'

import {
  Text,
  SPText,
  SPMediumText,
  SPTextHeading1,
  SPTextHeading2
} from '../../common/SPText'

import SPButton from '../../common/SPButton';
import Border from '../../common/Border';
import SectionHeader from '../../common/SectionHeader';
import EntryPickView from './EntryPickView';
import GameView from '../GameView';
import ActivityIndicator from '../ActivityIndicator';
import _ from 'underscore';
import moment from 'moment';
import TabView from '../TabView';
import { archiveEntry } from '../../actions/entries';
import { getGolfers } from '../../actions/pool';
import AndroidPicker from '../AndroidPicker';
import PickItem from '../PickItem';

const ROUND_FORMAT = 'MM-DD-YYYY';

class PGAEntryView extends Component {
  constructor(props) {
    super(props)

    const ds = new ListView.DataSource({
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
      rowHasChanged: (r1, r2) => r1 !== r2
    });


    this.state = {
      dataSource: ds.cloneWithRowsAndSections({"": []}),
      golfers: [],
      picks: props.entry.picks,
      groupedPicks: this.groupPicks(props.entry.picks),
      showAndroidPicker: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const entry = nextProps.entries.filter((e) => {
      return e._id == this.props.entry._id;
    }).shift();

    if (entry) {
      this.setState({
        picks: entry.picks,
        groupedPicks: this.groupPicks(entry.picks)
      });

      this.refreshGamesList();
    }
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props.navigator.pop();
      return true;
    });

    setTimeout(() => {
      this.getGolfers();
    }, 1000);
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  getGolfers() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: "Loading golfers..."
    });

    getGolfers(this.props.entry.pool).then(golfers => {
      var _golfers = golfers;

      // TODO: Filter out golfers that are defined in `pool.groups`.

      this.setState({
        golfers: _golfers,
        showEmptyGamesText: _golfers.length == 0
      });

      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });

      this.refreshGamesList();
    }).catch((error) => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });

      alert(error.message);
    });
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={
            <SPModalButton icon="ios-close" onPress={() => this.dismiss()} />
          }
          titleComponent={(
            <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
              <SPMediumText style={{color: 'white'}} numberOfLines={1}>
                {this.props.entry.pool.name}
              </SPMediumText>
              <SPText style={{color: 'white'}}>
                {this.props.entry.name}
              </SPText>
            </View>
          )}
          rightComponent={
            <SPModalButton icon="ios-information-circle-outline" onPress={() => this.openInfoActionSheet()} />
          }
          >
          <View
            style={{paddingTop:10, paddingHorizontal:10}}>
            <View style={{flexDirection: 'row', 'justifyContent': 'space-between', backgroundColor: 'transparent', marginBottom: 10}}>
              <View style={{flexDirection: 'row'}}>
                <SPText style={{color: 'white', fontSize: 16}}>Confirmed Picks</SPText>
              </View>
              <SPText style={{color: 'white', fontSize: 16}}>
                {this.state.picks.length + '/' + _.reduce(this.props.entry.pool.groups, (memo, group) => memo + group.count, 0)}
              </SPText>
            </View>
            <View style={styles.pickContainer}>
              {this.pickItems().map(c => c)}
            </View>
          </View>
        </SPModalHeader>
        <SPModalBody>
          {
            this.state.showEmptyGamesText ?
            <View>
              <Text styleName="h2 center" style={{marginTop: 40}}>
                Waiting for golfers to be announced.
              </Text>
              <Text styleName="center muted" style={{marginTop: 10}}>
                We'll notify you when golfers have been scheduled and picks can be made.
              </Text>
            </View>

            : this.props.entry.status == 'knocked_out' ?
            <View style={styles.messageContainer}>
              <SPTextHeading1>You Lost</SPTextHeading1>
              <SPText style={styles.messageText}>
                Well that sucks. On the plus side you’ve made other Survivors happy. 😂
              </SPText>
            </View>
            : this.props.entry.status == 'won' ?
            <View style={styles.messageContainer}>
              <SPTextHeading1>You Won!</SPTextHeading1>
              <SPText style={styles.messageText}>
                Congratulations. 🤑
              </SPText>
            </View>
            : this.allPicksLive() ?
            <View style={styles.messageContainer}>
              <SPTextHeading1>Games Are Live</SPTextHeading1>
              <SPText style={styles.messageText}>Waiting for the results...</SPText>
            </View>
            : this.props.entry.poolStatus == 'pending' ?
            <View style={styles.messageContainer}>
              <SPTextHeading1>Waiting Manager Approval</SPTextHeading1>
              <SPText style={styles.messageText}>Your pool manager must activate your entry before you can see the {this.props.entry.pool.league.name == 'PGA' ? "golfers" : "matchups"} and make picks.</SPText>
            </View>
            :
            <ListView
              enableEmptySections={true}
              renderSectionHeader={(golfers, name) => {
                var left = "", right = "";

                var group = this.props.entry.pool.groups.filter(group => {
                  return group.name == name;
                })[0];

                if (group) {
                  left = name;
                  const picks = this.state.groupedPicks[name];
                  right = `${picks.length}/${group.count}`;
                }

                return <SectionHeader
                  leftLabel={left}
                  rightLabel={right}
                />
              }}
              dataSource={this.state.dataSource}
              renderRow={(golfer) => {
                const name = golfer.group.name;
                const picks = this.state.groupedPicks[name];
                const max = picks.length == golfer.group.count

                return (
                  <GameView
                    key={`GameView${golfer._id}`}
                    entry={this.props.entry}
                    pick={golfer.pick}
                    picks={this.state.picks}
                    golfer={golfer}
                    reachedMaximumPicks={max}
                  />
                )
              }}
            />
          }

        </SPModalBody>

        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.text}
        />

        {Platform.OS === 'android' &&
          <AndroidPicker
            onRequestClose={() => this.setState({ showAndroidPicker: false })}
            visible={this.state.showAndroidPicker}
            title="Menu Options"
            items={this.pickerItems()}
          />
        }
      </SPModal>
    )
  }

  refreshGamesList() {
    this.setState((prevState, props) => {
      var data = {};

      props.entry.pool.groups.forEach(group => {
        data[group.name] = _.sortBy(prevState.golfers.filter(golfer => {
          return _.find(group.golfers, id => golfer._id == id) ? true : false;
        }).map(golfer => {
          var pick = prevState.picks.filter(pick => pick.golfer._id == golfer._id)[0];

          if (pick) {
            return {
              ...golfer,
              ...{
                pick: pick,
                group: group
              }
            }
          } else {
            return {
              ...golfer,
              ...{
                group: group
              }
            }
          }

          return golfer;
        }), golfer => golfer.rounds.length == 0 ? golfer.name.first : golfer.rounds[0].teeTime);

      });

      return {
        dataSource: prevState.dataSource.cloneWithRowsAndSections(data)
      }

    });
  }

  groupPicks(picks) {
    var data = {};

    this.props.entry.pool.groups.forEach(group => {
      data[group.name] = picks.filter(pick => {
        return _.contains(group.golfers, pick.golfer._id)
      });
    });

    return data;
  }

  dismiss() {
    this.props.navigator.pop()
  }

  pickerItems() {
    return ['View Pool Rules', 'Message Pool Manager'].map((title, index) => {
      return {
        key: index,
        title: title,
        onPick: () => {
          this.setState({
            showAndroidPicker: false
          });

          if (index == 0) {
            this.openPoolRules();
          } else if (index == 1) {
            this.openChat();
          }
        }
      }
    });
  }

  openInfoActionSheet() {
    if (Platform.OS === 'android') {
      return this.setState({ showAndroidPicker: true });
    }

    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Cancel', 'View Pool Rules', 'Message Pool Manager'],
      cancelButtonIndex: 0
    }, (index) => {
      if (index == 1) {
        this.openPoolRules();
      } else if (index == 2) {
        this.openChat();
      }
    });
  }

  openPoolRules() {
    this.props.navigator.push({
      poolRules: {},
      pool: this.props.entry.pool
    });
  }

  openChat() {
    this.props.navigator.push({
      chat: {},
      pool: this.props.entry.pool
    });
  }

  allPicksLive() {
    return this.props.entry.picks.filter((pick) => {
      return pick.golfer.pastTeeTime;
    }).length == this.state.numPicksNeeded;
  }

  pickItems() {
    var items = [];

    this.props.entry.pool.groups.forEach(group => {
      // All picks in group
      var picks = this.state.picks.filter(pick => {
        var _group = this.props.entry.pool.groups.filter(g => g.name == group.name)[0];
        if (_group) {
          return !!~_group.golfers.indexOf(pick.golfer._id);
        }

        return false;
      });

      _(group.count).times(idx => {
        var pick = picks[idx];

        var key = pick ? pick._id : `missing pick ${group.name} ${idx}`;
        var logo = pick ? pick.golfer.thumbnail : undefined;
        var alias = pick ? pick.golfer.name.last : group.name;
        var missing = pick === undefined;

        items.push(
          <PickItem
            missing={missing}
            style={styles.golfPickItem}
            labelStyle={styles.pickItemLabel}
            textColor={"white"}
            key={key}
            logo={logo}
            alias={alias}
          />
        )
      });
    });

    return items;
  }

}

const styles = StyleSheet.create({
  pickContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  pick: {
    marginBottom: 10,
    marginRight: 10
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50
  },
  messageButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20
  },
  messageText: {
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    fontSize: 16
  },
  golfPickItem: {
    width: (Dimensions.get('window').width - 40) / 5,
    marginBottom: 10
  },
  pickItemLabel: {
    color: 'white'
  }
})

const select = (store) => {
  return store;
}

export default connect(select)(PGAEntryView);
