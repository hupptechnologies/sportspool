import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ListView,
  ActionSheetIOS,
  TouchableOpacity,
  BackAndroid,
  Platform
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

import SectionHeader from '../../common/SectionHeader';
import EntryPickView from './EntryPickView';
import GameView from '../GameView';
import ActivityIndicator from '../ActivityIndicator';
import _ from 'underscore';
import moment from 'moment';
import { loadGames } from '../../actions/pool';
import TabView from '../TabView';
import { archiveEntry } from '../../actions/entries';
import AndroidPicker from '../AndroidPicker';

const ROUND_FORMAT = 'MM-DD-YYYY';

class EntryView extends Component {
  constructor(props) {
    super(props)

    const ds = new ListView.DataSource({
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    const games = [];

    const isFirstRound = props.entry.pool.currentRoundIndex == 0;
    var roundFilters = ['Current Round', 'Next'];
    if (this.props.entry.pool.currentRoundIndex > 0) {
      roundFilters.unshift('Previous');
    }

    const round = props.entry.status == 'knocked_out' ? props.entry.losingRound : props.entry.pool.currentRoundIndex;

    this.state = {
      isFirstRound: isFirstRound,
      roundFilters: roundFilters,
      // Select Current Round on SegmentedControlIOS
      roundIndex: isFirstRound ? 0 : 1,
      games: games,
      showEmptyGamesText: "",
      dataSource: ds.cloneWithRowsAndSections({"": []}),
      picks: props.entry.picks.filter(p => p.round == round),
      numPicksNeeded: props.entry.pool.rounds[round].count,
      archived: false,
      showAndroidPicker: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const entry = nextProps.entries.filter((e) => {
      return e._id == this.props.entry._id;
    }).shift();

    if (entry) {
      const round = entry.status == 'knocked_out' ? entry.losingRound : entry.pool.currentRoundIndex;
      const picks = entry.picks.filter(p => p.round == round)

      this.setState({
        picks: picks,
        archived: entry.archived
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
      this.getGames();
    }, 1000);
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  getGames() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: "Loading games..."
    });

    loadGames(this.props.entry.pool).then(games => {
      const sorted = games.sort((a, b) => {
        if (moment(a.start).isBefore(b.start)) {
          return -1;
        }
        if (moment(a.start).isAfter(b.start)) {
          return 1;
        }

        return 0;
      });

      this.setState({
        games: sorted,
        showEmptyGamesText: sorted.length == 0
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
          titleComponent={<View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><SPMediumText style={{color: 'white'}} numberOfLines={1}>{this.props.entry.pool.name}</SPMediumText><SPText style={{color: 'white'}}>{this.props.entry.name}</SPText></View>}
          rightComponent={
            <SPModalButton icon="ios-information-circle-outline" onPress={() => this.openInfoActionSheet()} />
          }
          >
          <View
            style={{paddingTop:10, paddingHorizontal:10}}>
            <View style={{flexDirection: 'row', 'justifyContent': 'space-between', backgroundColor: 'transparent', marginBottom: 10}}>
              <View style={{flexDirection: 'row'}}>
                <SPText style={{color: 'white', fontSize: 16}}>Confirmed Picks</SPText>
                <SPText style={{color: 'rgba(255,255,255,.5)', fontSize: 16}}> (Round {this.props.entry.status == 'knocked_out' ? this.props.entry.losingRound + 1 : this.props.entry.pool.currentRoundIndex + 1})</SPText>
              </View>
              <SPText style={{color: 'white', fontSize: 16}}>
                {this.state.picks.length + '/' + this.state.numPicksNeeded}
              </SPText>
            </View>
            {this.pickItems().map(c => c)}
          </View>
        </SPModalHeader>
        <SPModalBody>
          {
            this.state.showEmptyGamesText ?
            <View>
              <Text styleName="h2 center" style={{marginTop: 40}}>
                Waiting for teams to be announced.
              </Text>
              <Text styleName="center muted" style={{marginTop: 10}}>
                We'll notify you when games have been scheduled and picks can be made starting Monday, March 13th.
              </Text>
            </View>

            : this.props.entry.status == 'survived' && !this.nextRoundOpened() ?
            <View style={styles.messageContainer}>
              <SPTextHeading1>You Survived</SPTextHeading1>
              <SPText style={styles.messageText}>
                Congratulations on surviving to the next round. Sit back and relax. 🏆
              </SPText>

              {this.nextRoundStartDate() &&
                <View>
                  <SPTextHeading2 style={{marginTop: 40}}>
                    Next Round opens in
                  </SPTextHeading2>
                  <Text styleName="center" style={{marginTop: 10}}>{moment(this.nextRoundStartDate()).fromNow()}</Text>
                </View>
              }
            </View>
            : this.props.entry.status == 'survived' ?
            <View style={styles.messageContainer}>
              <SPTextHeading1>You Survived</SPTextHeading1>
              <SPText style={styles.messageText}>
                Congratulations to surviving to the next round. Tap “Start Next Round” to make picks for the next round.
              </SPText>
              <SPButton style={styles.messageButton} title="Start Next Round" onPress={() => this.startNextRound()} />
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
              <SPText style={styles.messageText}>Your pool manager must activate your entry before you can see the matchups and make picks.</SPText>
            </View>
            :
            <TabView
              selectedIndex={this.state.roundIndex}
              tabs={this.state.roundFilters}
              routes={this.routes()}
              onTabSelect={i => this.onTabSelect(i)}
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

  onTabSelect(index) {
    this.setState({
      roundIndex:index
    });

    this.refreshGamesList();
  }

  routes() {
    return this.state.roundFilters.map(filter => {
      return (
        <ListView
          key={filter}
          enableEmptySections={true}
          renderSectionHeader={(games, id) => {
            return <SectionHeader leftLabel="Available Games" rightLabel={id} />
          }}
          dataSource={this.state.dataSource}
          renderRow={(obj) => {
            if (this.props.managerEditing) {
              return <GameView
                key={obj.game._id}
                game={obj.game}
                pick={obj.pick}
                reachedMaximumPicks={this.state.picks.length == this.state.numPicksNeeded}
                isCurrentRound={this.state.isFirstRound ? this.state.roundIndex == 0 : this.state.roundIndex == 1}
                entry={this.props.entry}
                picks={this.state.picks}
                onUpdateCallback={(entry, pick, action) => {
                  this.managerDidChangePick(entry, pick, action)
                }}
              />
            } else {
              return <GameView
                key={obj.game._id}
                game={obj.game}
                pick={obj.pick}
                reachedMaximumPicks={this.state.picks.length == this.state.numPicksNeeded}
                isCurrentRound={this.state.isFirstRound ? this.state.roundIndex == 0 : this.state.roundIndex == 1}
                entry={this.props.entry}
                picks={this.state.picks}
              />
            }
          }}
        />
      )
    });
  }

  managerDidChangePick(entry, pick, action) {
    const round = entry.status == 'knocked_out' ? entry.losingRound : entry.pool.currentRoundIndex;
    var newPicks = entry.picks.filter(p => p.round == round)

    if (action == 'delete') {
      newPicks = newPicks.filter(p => {
        return p._id != pick._id
      })
    } else if (action == 'create') {
      newPicks = newPicks.concat([pick])
    } else {
      newPicks = newPicks.map(p => {
        if (p._id == pick._id) {
          return pick
        }
  
        return p
      })
    }

    this.setState({
      picks: newPicks
    })

    this.refreshGamesList()
  }

  refreshGamesList() {
    this.setState((prevState, props) => {
      var currentIndex = props.entry.pool.currentRoundIndex;

      if (!prevState.isFirstRound && prevState.roundIndex == 0) {
        currentIndex--;
      } else if (prevState.roundIndex == prevState.roundFilters.length - 1) {
        currentIndex++;
      }

      const round = props.entry.pool.rounds[currentIndex];
      const start = round.start;
      const next = props.entry.pool.rounds[currentIndex+1];
      const end = next ? next.start : null;

      const games = prevState.games.filter((game) => {
        const first = moment.utc(game.start).isSameOrAfter(start);
        const second = end ? moment(game.start).isBefore(end) : true;
        return first && second;
      }).sort();

      const data = {
        [round.name]: games.map((game) => {
          return {
            game,
            pick: prevState.picks.filter((pick) => {
              return pick.game._id == game._id
            }).shift()
          };
        })
      }

      return {
        dataSource: prevState.dataSource.cloneWithRowsAndSections(data)
      }
    });
  }

  roundFilterChanged(newIndex) {
    this.setState({
      roundIndex: newIndex
    });

    this.refreshGamesList();
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
    if (this.state.numPicksNeeded == 0) {
      return false;
    }

    return this.props.entry.picks.filter((pick) => {
      const game = this.gameForPick(pick);
      if (game) {
        return game.status == 'inprogress';
      }

      return false;
    }).length == this.state.numPicksNeeded;
  }

  nextRoundStartDate() {
    const nextRound = this.props.entry.pool.rounds[this.props.entry.pool.currentRoundIndex + 1];

    if (nextRound && nextRound.start) {
      return nextRound.start;
    } else {
      return null;
    }
  }

  // All games for the previous round have finished.
  nextRoundOpened() {
    return false;
  }

  // Reveals games for the current round.
  startNextRound() {

  }

  // Archiving sends entry to "My Past Entries" and removes it from the list of entries on the entries screen
  archiveEntry() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Archiving entry...'
    });

    this.props.dispatch(archiveEntry(this.props.entry, this.props.auth.token));
    this.dismiss();
  }

  pickItems() {
    var items = [];
    const made = this.state.picks.length;
    const needed = this.state.numPicksNeeded;

    _(needed).times((idx) => {
      if (idx < made) {
        const pick = this.state.picks[idx];
        if (this.props.managerEditing) {
          items.push(
            <EntryPickView
              key={idx}
              style={styles.pick}
              pick={pick}
              game={this.gameForPick(pick)}
              entry={this.props.entry}
              onUpdateCallback={(entry, pick, action) => {
                this.managerDidChangePick(entry, pick, action)
              }}
            />
          )
        } else {
          items.push(
            <EntryPickView
              key={idx}
              style={styles.pick}
              pick={pick}
              game={this.gameForPick(pick)}
              entry={this.props.entry}
            />
          )
        }
      } else {
        items.push(
          <EntryPickView key={idx} style={styles.pick} entry={this.props.entry} />
        )
      }
    })

    return items
  }

  gameForPick(pick) {
    return this.state.games.filter((game) => {
      return pick.game._id == game._id
    }).shift();
  }

}

const styles = StyleSheet.create({
  pick: {
    marginBottom: 10
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
  }
})

const select = (store) => {
  return store;
}

export default connect(select)(EntryView);
