import React from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ListView,
  Platform,
  ScrollView,
  Image,
  ActionSheetIOS
} from 'react-native';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';
import { Text, SPBoldText, SPMediumText, SPText } from '../../common/SPText';
import LeaderboardBar from '../LeaderboardBar';
import PickOverviewItem from './PickOverviewItem';
import EntryItem from './EntryItem';
import SectionHeader from '../../common/SectionHeader';
import Border from '../../common/Border';
import _ from 'underscore';
import TabView from '../TabView';
import { getPoolStats, getPoolOverview, getAudit } from '../../actions/pool';
import AndroidPicker from '../AndroidPicker';
import ActivityIndicator from '../ActivityIndicator';
import PickItem from '../PickItem';

class PoolOverview extends React.Component {

  constructor(props) {
    super(props);

    var activeEntries = props.entries.filter(entry => {
      return !!~['activated', 'activated_paid'].indexOf(entry.poolStatus) && entry.status != 'knocked_out' && entry.pool._id == props.pool._id
    }).map(entry => {
      var round = props.pool.currentRoundIndex
      var numPicksThisRound = entry.picks.filter(pick => pick.round == round).length
      var requiredPicks = props.pool.rounds[props.pool.currentRoundIndex].count
      var missingPicks = [...entry.picks];

      _.times(requiredPicks - numPicksThisRound, n => {
        missingPicks.push({ missing: true, team: {}, round: round })
      })

      return {
        ...entry,
        picks: missingPicks
      }
      
    });


    this.state = {
      showAndroidPicker: false,
      stats: {
        pending: 0,
        survived: 0,
        knockedOut: 0,
        survivors: 0
      },
      selectedSegmentIndex: props.pool.league.name == 'PGA' || props.pool.status == 'closed' ? 1 : 0,
      picks: [],
      activeEntries: [],
      deadEntries: [],
      userActiveEntries: activeEntries,
      userDeadEntries: props.entries.filter(entry => {
        return entry.status == 'knocked_out' && entry.pool._id == props.pool._id
      }),
      pickOverviewDataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }).cloneWithRows([]),
      activeEntriesDataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }).cloneWithRows([]),
      deadEntriesDataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }).cloneWithRows([])
    };
  }

  componentDidMount() {
    var poolId = this.props.pool._id
    getPoolStats(poolId).then(stats => {
      this.props.dispatch({
        stats,
        poolId,
        type: 'UPDATE_POOL_STATS'
      })

      this.setState({
        stats
      });
    }).catch(err => alert(err.message));

    setTimeout(() => {
      this.fetchPoolOverview(this.state.selectedSegmentIndex);
    }, 3);
  }

  render() {

    var components = [];

    if (this.props.pool.status == "closed") {
      var str = `${this.props.pool.name} has completed.`
      if (this.state.activeEntries.length > 0) {
        str += ` Congratulations to ${this.state.activeEntries.map(e => e.name).join(', ')}.`
      }

      components.push(
        <View key="closed message" style={{ padding: 20 }}>
          <Text styleName="center translucent">
            {str}
          </Text>
        </View>
      )
    } else {
      if (this.props.pool.style == 'Survivor' && this.state.stats) {
        components.push(
          <LeaderboardBar
            key="leaderboard bar"
            numSurvivors={this.state.stats.survivors}
          />
        );

         components.push(
          <View style={styles.statContainer} key="ncaab pool stats">
            {this.statView(this.state.stats.pending, 'Pending')}
            {this.statView(this.state.stats.survived, 'Survived')}
            {this.statView(this.state.stats.knockedOut, 'Knocked Out')}
          </View>
        )
      }

      if (this.props.pool.league.name == 'PGA') {
        components.push(
          <View style={styles.statContainer} key="pga pool stats">
            {this.statView(this.state.stats.survivors + this.state.stats.knockedOut, 'Total Entries')}
            {this.statView(this.state.stats.survivors, 'Leaderboard')}
            {this.statView(this.state.stats.knockedOut, 'Missed Cut')}
          </View>
        )
      }

    }

    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()} />}
          titleComponent={this.titleView()}
          rightComponent={<SPModalButton icon="ios-information-circle-outline" onPress={() => this.openInfoActionSheet()} />}
        >
        {components.map(component => {
          return component;
        })}
        </SPModalHeader>
        <SPModalBody>
          <TabView
            selectedIndex={this.state.selectedSegmentIndex}
            tabs={['Pick Overview', this.props.pool.league.name == 'PGA' ? 'Leaderboard' : this.props.pool.status == "closed" ? 'Winners' : 'Survivors', this.props.pool.league.name == 'PGA' ? 'Missed Cut' : 'Knocked Out']}
            onTabSelect={(index) => {
              this.fetchPoolOverview(index);
            }}
            routes={this.routes()}
          />
        </SPModalBody>
        {Platform.OS === 'android' &&
          <AndroidPicker
            onRequestClose={() => this.setState({ showAndroidPicker: false })}
            visible={this.state.showAndroidPicker}
            title="Menu Options"
            items={this.pickerItems()}
          />
        }
        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.text}
        />
      </SPModal>
    )
  }

  routes() {
    var arr = [];

    if (this.props.pool.league.name == 'PGA' && this.state.picks.length == 0) {
      arr.push(
        <Text styleName="center h3" style={{ marginTop: 60, padding: 20 }}>
          The distribution of each golfer picked will display here after teeing off on Thursday.
        </Text>
      );
    } else {
      arr.push(
        <ListView
          enableEmptySections={true}
          removeClippedSubviews={false}
          renderSeparator={() => <Border key={_.uniqueId()} /> }
          dataSource={this.state.pickOverviewDataSource}
          renderSectionHeader={(v,k) => <SectionHeader leftLabel={k !== 's1' ? k : "Pick Overview"} />}
          renderRow={(o,sid,rid) => {
            return <PickOverviewItem key={`PickOverviewItem${rid}`} item={o} />
          }}
        />
      )
    }

    arr.push(
      <ListView
        enableEmptySections={true}
        removeClippedSubviews={false}
        renderSectionHeader={(v,k) => <SectionHeader leftLabel={k} rightLabel={v.length} />}
        renderSeparator={() => <Border key={_.uniqueId()} />}
        dataSource={this.state.activeEntriesDataSource}
        renderRow={e => {
          return (
            <EntryItem
              key={e._id}
              topLabel={e.name}
              leftLabel={e.rank}
              rightLabel={(() => {
                if (this.props.pool.league.name == "PGA") {
                  var scores = _.sortBy(e.picks.filter(pick => pick.golfer.status == "active").map(pick => pick.golfer.total));
                  var score = _.reduce(scores.slice(0,5), (memo, score) => memo + score, 0);
                  return score == 0 ? "E" : score > 0 ? `+${score}` : `${score}`;
                }
                return null;
              })()
              }
              rightView={(() => {
                if (this.props.pool.league.name == "PGA") { return null; }
                 return (
                   <ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                    {[...e.picks].reverse().map((pick, idx) => {
                      return (
                        <PickItem
                          key={pick.missing ? `missing pick ${idx}` : pick._id}
                          topLabel={`RD ${pick.round+1}`}
                          logo={pick.team.logo}
                          alias={pick.missing ? "TBD" : pick.team.abbr}
                          logoStyle={styles.logoStyle}
                          won={pick.won}
                          labelStyle={{ fontSize: 11 }}
                          missing={pick.missing}
                          missingStyles={{fontSize: 25, marginTop: -3}}
                        />
                      )
                    })}
                  </ScrollView>
                );
              })()}
              onPress={() => {
                if (this.props.pool.league.name == "PGA") {
                  this.openSneakPeek(e)
                }
              }}
            />
          )
        }}
      />
    );

    if (this.props.pool.league.name == 'PGA' && this.state.deadEntries.length == 0) {
      arr.push(
        <Text styleName="center h3" style={{ marginTop: 60, padding: 20 }}>
          Players with 6 or more golfers who miss the cut are eliminated, and will appear here.
        </Text>
      );
    } else {
      arr.push(
        <ListView
          enableEmptySections={true}
          removeClippedSubviews={false}
          renderSectionHeader={() => <SectionHeader leftLabel={this.props.pool.league.name == 'PGA' ? "Missed Cut" : "Dead Entries"} rightLabel={this.state.deadEntries.length} />}
          renderSeparator={() => <Border key={_.uniqueId()} />}
          dataSource={this.state.deadEntriesDataSource}
          renderRow={e => {
            return (
              <EntryItem
                key={e._id}
                topLabel={e.name}
                rightView={(() => {
                if (this.props.pool.league.name == "PGA") { return null; }
                  // Need to fill in picks for the rounds that the entry didn't participate it so that every entry has the same number of picks

                  var picks = [...e.picks];
                  this.props.pool.rounds.forEach((round, index) => {
                    if (index >= e.losingRound) {
                      var madePicks = picks.filter(pick => pick.round == index);
                      _(round.count - madePicks.length).times(() => {
                        picks.push({
                          _id: _.uniqueId('pick_'),
                          round: index,
                          x: true,
                          won: false,
                          team: {
                            logo: null,
                            abbr: ""
                          }
                        })
                      });
                    }
                  });

                 return (
                   <ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                    {picks.reverse().map(pick => {
                      return (
                        <PickItem
                          key={pick._id}
                          topLabel={`RD ${pick.round+1}`}
                          logo={pick.team.logo}
                          alias={pick.team.abbr}
                          logoStyle={styles.logoStyle}
                          won={pick.won}
                          x={pick.x}
                          labelStyle={{ fontSize: 11 }}
                        />
                      )
                    })}
                  </ScrollView>
                );
              })()}
                rightLabel={(() => {
                  if (this.props.pool.league.name == "PGA") {
                    var scores = _.sortBy(e.picks.filter(pick => pick.golfer.status == "active").map(pick => pick.golfer.total));
                    var score = _.reduce(scores.slice(0,5), (memo, score) => memo + score, 0);
                    return score == 0 ? "E" : score > 0 ? `+${score}` : `${score}`;
                  }
                  return null;
                })()}
                onPress={() => {
                  if (this.props.pool.league.name == "PGA") {
                    this.openSneakPeek(e)
                  }
                }}
              />
            )
          }}
        />
      )
    }

    return arr;
  }

  titleView() {
    return (
      <View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
        <SPMediumText style={{color: 'white'}} numberOfLines={1}>
          {this.props.pool.name}
        </SPMediumText>
        {this.props.pool.style == 'Survivor' &&
        <SPText style={{color: 'white'}}>
          Round {this.props.pool.currentRoundIndex + 1} of {this.props.pool.rounds.length}
        </SPText>
        }
      </View>
    )
  }

  statView(count, label) {
    return (
      <View style={{alignItems: 'center', paddingHorizontal: 20}}>
        <Text styleName="white" style={styles.counter}>{count}</Text>
        <Text styleName="translucent" style={styles.counterLabel}>{label}</Text>
      </View>
    )
  }

  dismiss() {
    this.props.navigator.pop()
  }

  fetchPoolOverview(index) {
    const filter = ['pick', 'active_entries', 'dead_entries'][index];
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Loading...'
    });
    getPoolOverview(this.props.pool, filter)
      .then(json => {
        this.props.dispatch({
          type: 'HIDE_ACTIVITY_INDICATOR',
        });
        var newState = {};
        if (json.pick) {
          newState.picks = json.pick;

          if (this.props.pool.league.name == "PGA") {
            var data = {};
            this.props.pool.groups.forEach(group => {
              data[group.name] = json.pick.filter(pick => {
                return _.find(group.golfers, g => g == pick.golfer._id) ? true : false
              });
            });

            newState.pickOverviewDataSource = this.state.pickOverviewDataSource.cloneWithRowsAndSections(data);
          } else {
            newState.pickOverviewDataSource = this.state.pickOverviewDataSource.cloneWithRows(json.pick);
          }
        } else if (json.active) {
          newState.activeEntries = json.active;

          if (this.props.pool.style == 'Best 5 of 10') {
            var entries = json.active;
            var index = 0;
            var length = json.active.length;
            var ranks = [];
            var currentRank = 1;
            var current = entries[index];
            var next = entries[index + 1];
            var tied = false;

            while (index < length && next !== undefined) {
              var j = 5;
              var stop = false;
              var scores1 = _.sortBy(current.picks.filter(pick => pick.golfer.status == "active").map(pick => pick.golfer.total));
              var scores2 = _.sortBy(next.picks.filter(pick => pick.golfer.status == "active").map(pick => pick.golfer.total));
              var len = Math.max(scores1.length, scores2.length);

              while (j <= len && !stop) {
                var slice1 = scores1.slice(0, j);
                var slice2 = scores2.slice(0, j);
                var score1 = _.reduce(slice1, (memo, score) => memo + score, 0);
                var score2 = _.reduce(slice2, (memo, score) => memo + score, 0);

                if (score1 < score2) {
                  stop = true;
                } else if (j > 5 && slice1.length > slice2.length) {
                  stop = true;
                }

                j++;
              }

              if (stop) {
                if (tied) {
                  ranks.push(`T${currentRank}`);
                } else {
                  ranks.push(`${currentRank}`);
                }
                tied = false;
                currentRank = index + 2;
              } else {
                tied = true;
                ranks.push(`T${currentRank}`);
              }

              index++;
              current = entries[index];
              next = entries[index+1];
            }

            var diff = entries.length - ranks.length;
            _(diff).times(() => {
              ranks.push(`${currentRank}`);
              currentRank++;
            })

            var leaderboard = json.active.map((entry, index) => {
              return Object.assign({}, entry, {
                rank: ranks[index] || ""
              })
            });

            // Find all of the user's entry and place them at the beginning.
            var ids = this.props.myEntries.map(entry => entry._id);
            var myEntries = leaderboard.filter(entry => _.contains(ids, entry._id));

            newState.activeEntriesDataSource = this.state.activeEntriesDataSource.cloneWithRowsAndSections({
              "My Entries": myEntries,
              "Leaderboard": leaderboard
            });
          } else {
            var data = {};

            if (this.state.userActiveEntries.length > 0) {
              data['My Active Entries'] = _.sortBy(this.state.userActiveEntries, e => e.name.toLowerCase())
            }

            data['All Active Entries'] = _.sortBy(json.active, e => e.name.toLowerCase())

            newState.activeEntriesDataSource = this.state.activeEntriesDataSource.cloneWithRowsAndSections(data);
          }

        } else if (json.dead) {
          newState.deadEntries = json.dead;

          var data = {};
          
          if (this.state.userDeadEntries.length > 0) {
            data['My Dead Entries'] = _.sortBy(this.state.userDeadEntries, e => e.name.toLowerCase())
          }

          data['All Dead Entries'] = _.sortBy(json.dead, e => e.name.toLowerCase())

          newState.deadEntriesDataSource = this.state.deadEntriesDataSource.cloneWithRowsAndSections(data);
        }

        this.setState(newState);
      })
      .catch(err => {
        this.props.dispatch({
          type: 'HIDE_ACTIVITY_INDICATOR',
        });
        alert(err.message);
      });
  }

  pickerItems() {    
    return this.pickerOptions().map((title, index) => {
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
          } else if (index == 2) {
            this.getPlayerPickSpreadsheet()
          }
        }
      }
    });
  }

  pickerOptions() {
    var opts = ['View Pool Rules', 'Message Pool Manager'];

    if (this.props.pool.style == 'Survivor') {
      opts.push('Get Spreadsheet of Player Picks');
    }

    return opts;
  }

  openInfoActionSheet() {
    if (Platform.OS === 'android') {
      return this.setState({ showAndroidPicker: true });
    }

    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Cancel'].concat(this.pickerOptions()),
      cancelButtonIndex: 0
    }, (index) => {
      if (index == 1) {
        this.openPoolRules();
      } else if (index == 2) {
        this.openChat();
      } else if (index == 3) {
        this.getPlayerPickSpreadsheet()
      }
    });
  }

  openPoolRules() {
    this.props.navigator.push({
      poolRules: {},
      pool: this.props.pool
    });
  }

  openChat() {
    this.props.navigator.push({
      chat: {},
      pool: this.props.pool
    });
  }

  openSneakPeek(entry) {
    this.props.navigator.push({
      sneakPeek: true,
      entry: entry,
      pool: this.props.pool
    });
  }

  getPlayerPickSpreadsheet() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Sending...'
    });

    getAudit(this.props.pool, this.props.auth.token).then(res => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR',
      });
      alert(res.message)
    }).catch(err => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR',
      });
      alert(err.message)
    })
  }
  
}

const styles = StyleSheet.create({
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 15
  },
  counter: {
    fontSize: 18
  },
  counterLabel: {
    fontSize: 14,
    marginTop: -3
  },
  logoStyle: {
    width: 25,
    height: 25
  }
});

export default connect(store => store)(PoolOverview);
