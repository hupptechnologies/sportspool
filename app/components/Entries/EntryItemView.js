import React, { Component } from 'react'
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native'
import _ from 'underscore'

import { SPMediumText, SPText } from '../../common/SPText'
import LinearGradient from 'react-native-linear-gradient';
import PickItem from '../PickItem';

export default class EntryItemView extends Component {

  render() {
    var overrides = {};

    if (this.props.entry.pool.league.name == 'PGA') {
      overrides = {
        touchContainer: {
          flexDirection: 'column',
          paddingBottom: 10
        },
        pickContainer: {
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }
      }
    }

    return (
      <View>
        <View>
          <TouchableOpacity
            style={[styles.touchContainer, overrides.touchContainer]}
            onPress={this.props.onPress}
          >
            <View style={styles.textContainer}>
              <SPMediumText style={[styles.name, this.entryColor()]}>
                {this.props.entry.name}
              </SPMediumText>
              <SPText style={styles.status}>
                {this.statusText()}
              </SPText>
            </View>
            <View style={[styles.pickContainer, overrides.pickContainer]}>
              {this.picksComponent().map(c => c)}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.border} />
      </View>
    )
  }

  picksComponent() {
    var views = [];
    // Don't show missing picks for pending entry
    if (this.props.entry.poolStatus == 'pending') {
      return views;
    }

    const pool = this.props.entry.pool;

    if (pool.league.name == 'PGA') {

      pool.groups.forEach(group => {
        // All picks in group
        var picks = this.props.entry.picks.filter(pick => {
          var _group = pool.groups.filter(g => g.name == group.name)[0];
          if (_group) {
            return !!~_group.golfers.indexOf(pick.golfer._id);
          }

          return false;
        });

        _(group.count).times(idx => {
          var pick = picks[idx];
          if (pick) {
            views.push(
              <PickItem
                style={styles.golfPickItem}
                key={pick._id}
                logo={pick.golfer.thumbnail}
                alias={pick.golfer.name.last}
                bubbleText={pick.golfer.status == "cut" ? "CUT" : pick.golfer.pastTeeTime ? `${pick.golfer.total == 0 ? "E" : pick.golfer.total > 0 ? `+${pick.golfer.total}` : pick.golfer.total}` : undefined}
                missedCut={pick.golfer.status == "cut"}
              />
            )
          } else { // Missing pick for group
            views.push(
              <PickItem style={styles.golfPickItem} key={`missing pick ${group.name} ${idx}`} missing={true} alias={group.name} />
            )
          }
        });
      });

      return views;
    }

    const needed = this.props.entry.pool.numPicksNeeded || 0;
    const picks = this.currentPicks();

    if (this.props.entry.status == 'knocked_out') {
      return this.props.entry.picks.filter((pick) => {
        return pick.round == this.props.entry.losingRound;
      }).map((pick, idx) => {
        return (
          <PickItem style={{ marginLeft: 15 }} key={idx} id={pick.team._id} logo={pick.team.logo} alias={pick.team.abbr} />
        )
      });
    }

    _(needed).times((idx) => {
      if (idx < picks.length) {
        const pick = picks[idx];
        views.push(
          <PickItem style={{ marginLeft: 15 }} key={idx} id={pick.team._id} logo={pick.team.logo} alias={pick.team.abbr} />
        )
      } else {
        views.push(
          <View style={[styles.pick, styles.missingPick]} key={idx}>
            <Text style={{fontSize: 34}}>❓</Text>
          </View>
        )
      }
    });

    return views;
  }

  currentPicks() {
    return this.props.entry.picks.filter(p => p.round == this.props.entry.pool.currentRoundIndex);
  }

  statusText() {
    if (this.props.entry.poolStatus == 'pending') {
      return 'Pending activation by manager 💤';
    }

    if (this.props.entry.poolStatus == 'rejected') {
      return 'Rejected by manager';
    }

    const status = this.props.entry.status

    // Temporary fix to force the entry's new status to be displayed before a
    // refresh can be performed.
    const pool = this.props.entry.pool;
    var confirmedPicks = false;

    if (pool.league.name == "PGA") {
      confirmedPicks = this.props.entry.picks.length == _.reduce(pool.groups, (memo, group) => memo + group.count, 0);
    } else {
      const round = pool.rounds[pool.currentRoundIndex];
      if (round && this.currentPicks().length >= round.count) {
        confirmedPicks = true;
      }
    }

    switch (status) {
      case 'make_picks':
        if (confirmedPicks) {
          return 'Picks Confirmed 👍';
        }
        return 'Make Picks 🤔';
        break
      case 'picks_confirmed':
        if (!confirmedPicks) {
          return 'Make Picks 🤔';
        }
        return 'Picks Confirmed 👍';
        break;
      case 'survived':
        return 'Survived 😀';
        break;
      case 'knocked_out':
        return 'Knocked Out 😢';
        break;
      case 'won':
        return 'You Won 🤑';
        break;
      default:
        return '';
        break
    }

    return status;
  }

  entryColor() {
    var color = '#333';

    const status = this.props.entry.status;
    if (status == 'knocked_out') {
      color = '#E85D5D';
    } else if (status == 'survived') {
      color = '#24B879';
    }

    return { color };
  }

  gradientColors() {
    if (this.props.entry.status == 'survived') {
      return ['#bdead7', '#24B879']
    } else if (this.props.entry.status == 'knocked_out') {
      return ['#f8cfcf', '#E85D5D']
    }

    return ['#ffffff']
  }

}

const styles = StyleSheet.create({
  textContainer: {
    paddingVertical: 15
  },
  touchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  pickContainer: {
    flexDirection: 'row'
  },
  name: {
    color: '#333',
    fontSize: 14,
    marginBottom: 1,
    backgroundColor: 'transparent'
  },
  status: {
    color: '#999',
    fontSize: 14,
    backgroundColor: 'transparent'
  },
  border: {
    backgroundColor: '#F5F5F5',
    height: 1
  },
  pick: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    backgroundColor: 'transparent'
  },
  pickLogo: {
    width: 40,
    height: 40
  },
  pickName: {
    color: '#999',
    fontSize: 12,
    marginTop: 2
  },
  golfPickItem: {
    width: (Dimensions.get('window').width - 40) / 5,
    marginBottom: 10
  }
})
