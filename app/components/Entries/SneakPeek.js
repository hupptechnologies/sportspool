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

    this.state = {
      dataSource: ds.cloneWithRowsAndSections({"": []}),
      groupedPicks: this.groupPicks(props.entry.picks)
    };
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props.navigator.pop();
      return true;
    });

    if (this.props.pool.league.name == "PGA") {
      this.setupGolfers();
    }
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  }

  groupPicks(picks) {
    var data = {};

    this.props.pool.groups.forEach(group => {
      data[group.name] = picks.filter(pick => {
        return _.contains(group.golfers, pick.golfer._id)
      });
    });

    return data;
  }

  setupGolfers() {
    this.setState((prevState, props) => {
      var data = {};

      var active = props.entry.picks.filter(pick => pick.golfer.status == "active").map(pick => pick.golfer);
      var cut = props.entry.picks.filter(pick => pick.golfer.status == "cut").map(pick => pick.golfer);
      var golfers = _.sortBy(active, golfer => golfer.total);
      data['Top 5'] = golfers.splice(0, 5);
      data['Bottom 5'] = golfers.concat(cut);

      return {
        dataSource: prevState.dataSource.cloneWithRowsAndSections(data)
      }

    });
  }

  render() {
    var title = this.props.entry.status;

    if (this.props.pool.league.name == "PGA") {
      var scores = _.sortBy(this.props.entry.picks.filter(pick => pick.golfer.status == "active").map(pick => pick.golfer.total));
      var score = _.reduce(scores.slice(0,5), (memo, score) => memo + score, 0);
      title = score == 0 ? "E" : score > 0 ? `+${score}` : `${score}`;
    }

    return (
      <SPModal>
        <SPModalHeader
          leftComponent={
            <SPModalButton icon="ios-close" onPress={() => this.dismiss()} />
          }
          titleComponent={<View style={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><SPMediumText style={{color: 'white'}}>{this.props.pool.name}</SPMediumText><SPText style={{color: 'white'}}>{this.props.entry.name}</SPText></View>}
          >
          <View
            style={{paddingTop:10, paddingHorizontal:10}}>
            <View style={{flexDirection: 'row', 'justifyContent': 'space-between', backgroundColor: 'transparent', marginBottom: 10}}>
              <View style={{flexDirection: 'row'}}>
                <Text styleName="translucent" style={{ fontSize: 16}}>
                  {this.props.pool.league.name == "PGA" ?
                  "Score" :
                  "Status"
                  }
                </Text>
              </View>
              <SPText style={{color: 'white', fontSize: 16}}>
                {title}
              </SPText>
            </View>
          </View>
        </SPModalHeader>
        <SPModalBody>
          {moment.utc().isBefore(moment.utc(this.props.pool.start)) ?
            <View>
              <Text styleName="h2 center" style={{marginTop: 40}}>
                Waiting for the tournament to start.
              </Text>
              <Text styleName="center muted" style={{marginTop: 10, paddingHorizontal: 15}}>
                {this.props.entry.name}'s picks will become available once their
                golfers tee off.
              </Text>
            </View>
          :
          <ListView
            enableEmptySections={true}
            renderSectionHeader={(picks, id) => {
              return <SectionHeader leftLabel={id} rightLabel={""} />
            }}
            dataSource={this.state.dataSource}
            renderRow={(obj) => {
              if (this.props.pool.league.name == "PGA") {
                return (
                  <GameView
                    key={`GameView${obj._id}`}
                    entry={this.props.entry}
                    pick={obj.pick}
                    picks={this.state.picks}
                    golfer={obj}
                    canSelect={false}
                  />
                )
              }

              return <GameView
                key={obj.game._id}
                game={obj.game}
                pick={obj.pick}
                reachedMaximumPicks={this.state.picks.length == this.state.numPicksNeeded}
                isCurrentRound={this.state.isFirstRound ? this.state.roundIndex == 0 : this.state.roundIndex == 1}
                entry={this.props.entry}
                picks={this.state.picks}
                canSelect={false}
              />
            }}
          />
          }
        </SPModalBody>
      </SPModal>
    )
  }

  dismiss() {
    this.props.navigator.pop()
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
