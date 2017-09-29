import React from 'react';
import { connect } from 'react-redux';
import {
  TouchableWithoutFeedback,
  Image,
  View,
  StyleSheet,
  ActionSheetIOS,
  Alert,
  Platform
} from 'react-native';
import moment from 'moment';
import {
  Text,
  SPText,
  SPMediumText
} from '../common/SPText';
import Border from '../common/Border';
import {
  createPick,
  switchPick,
  deletePick,
  managerCreatePick,
  managerSwitchPick,
  managerDeletePick
} from '../actions/entries';

/**
 * @desc View for a game in the available matchups.
 */

class GameView extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    var statusText = "";
    var body = null;

    if (this.props.golfer) {
      var round = this.props.golfer.rounds.filter(round => round.number == 1)[0];
      if (round) {
        statusText = moment(round.teeTime).format('h:mm a');
      } else {
        statusText = "Time TBD";
      }

      if (this.props.golfer.pastTeeTime) {
        statusText = this.props.golfer.total == 0 ? "E" : this.props.golfer.total > 0 ? `+${this.props.golfer.total}` : `${this.props.golfer.total}`;

        if (this.props.golfer.status == "cut") {
          statusText = "CUT";
        }
      }

      body = (
        <View style={{flexGrow: 1}}>
          {this.golferSelectionRow(this.props.golfer)}
        </View>
      );
    } else {
      const game = this.props.game;
      const awayTeam = game.awayTeam;
      const homeTeam = game.homeTeam;

      statusText = game.status == 'pregame' ? moment(game.start).format('h:mm a') : game.status == 'inprogress' ? (game.displayStatus || "") : 'Final';

      body = (
        <View style={{flexGrow: 1}}>
          {this.teamSelectionRow(awayTeam, game.awayPoints)}
          {this.teamSelectionRow(homeTeam, game.homePoints)}
        </View>
      );
    }

    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          {body}
          <SPText style={styles.status}>
            {statusText}
          </SPText>
        </View>
        <Border/>
      </View>
    )
  }

  teamSelectionRow(team, score) {
    const selected = this.isTeamSelected(team);
    const canSelect = this.canSelectTeam(team);
    const hasUsed = this.teamAlreadyUsed(team);
    const seed = this.seed(team);

    const pick = this.picksWithTeam(team).pop();
    const roundUsed = pick ? pick.round + 1 : null;

    var logoStyles = {opacity: 1.0};
    var nameStyles = {color: '#333'};
    var scoreStyles = {color: '#999'}

    if (this.props.game.status == 'final') {
      if (this.teamWon(team)) {
        scoreStyles.color = '#333';
        nameStyles.fontWeight = '500';
        scoreStyles.fontWeight = '500';
      } else {
        logoStyles = {opacity: 0.15};
        nameStyles.color = '#999';
        nameStyles.fontWeight = '400';
      }
    }

    const row = (
      <View style={styles.selectionRow}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
        { selected ?
          <Image style={styles.selection} source={require('../common/images/selected.png')} />
        : canSelect ?
          <Image style={styles.selection} source={require('../common/images/select.png')} />
        : hasUsed ?
          <Text style={styles.usedRound} styleName="muted center">
            {`USED\nRD${roundUsed}`}
          </Text>
        :
          <View style={styles.emptySelection} />
        }
          <Image style={[styles.logo, logoStyles]} source={{uri: team.logo}} />
          {seed &&
            <SPText style={{color: '#999'}}>{seed} </SPText>
          }
          <SPMediumText style={nameStyles}>{team.displayName}</SPMediumText>
        </View>
        {this.props.game.status != 'pregame' && <SPText style={scoreStyles}>{score}</SPText> }
      </View>
    );

    if (canSelect) {
      return (
        <TouchableWithoutFeedback onPress={() => this.selectedTeam(team)}>
          {row}
        </TouchableWithoutFeedback>
      );
    }

    return row
  }

  golferSelectionRow(golfer) {
    var selected = this.props.pick ? this.props.pick.golfer._id == golfer._id : false;
    var canSelect = this.canSelectTeam();

    const row = (
      <View style={styles.selectionRow}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
        { selected ?
          <Image style={styles.selection} source={require('../common/images/selected.png')} />
        : canSelect ?
          <Image style={styles.selection} source={require('../common/images/select.png')} />
        :
          <View style={styles.emptySelection} />
        }
          <Image style={[styles.logo]} source={{uri: golfer.thumbnail}} />
          <SPMediumText>
            {golfer.name.first} {golfer.name.last}
          </SPMediumText>
        </View>
      </View>
    );

    if (canSelect) {
      return (
        <TouchableWithoutFeedback onPress={() => this.selectedGolfer(golfer)}>
          {row}
        </TouchableWithoutFeedback>
      );
    }

    return row;
  }

  seed(team) {
    const game = this.props.game;

    if (team._id == game.awayTeam._id && game.awaySeed) {
      return game.awaySeed;
    }

    if (team._id == game.homeTeam._id && game.homeSeed) {
      return game.homeSeed;
    }

    return null;
  }

  teamWon(team) {
    const game = this.props.game;
    return team._id == game.awayTeam._id ? game.awayPoints > game.homePoints : game.homePoints > game.awayPoints;
  }

  isTeamSelected(team) {
    const pick = this.props.pick;

    if (pick) {
      return pick.team._id == team._id
    }

    return false
  }

  /**
   * Whether the user can select the team, which is defined by the
   * following: game isn't live or hasn't ended and the user hasn't exceeded the
   * maximum number of picks for the team.
   */
  canSelectTeam(team): boolean {
    if (!~['activated', 'activated_paid'].indexOf(this.props.entry.poolStatus)) {
      return false;
    }

    if (this.props.golfer) {
      if (this.props.pick) {
        return !this.props.golfer.pastTeeTime;
      }

      return !this.props.golfer.pastTeeTime && !this.props.reachedMaximumPicks;
    }


    if (this.isTeamSelected(team) && this.props.game.status == 'pregame') {
      return true;
    }

    return this.props.game.status == 'pregame' && !this.teamAlreadyUsed(team) && !this.props.reachedMaximumPicks && this.props.isCurrentRound;
  }

  picksWithTeam(team): array {
    return this.props.entry.picks.filter(pick => {
      // FIXME: Selecting team and then de-selecting causes the team to be "Used"
      // This temporary fix ensures we are only comparing the current team to
      // teams from picks in previous rounds.
      if (pick.round != this.props.entry.pool.currentRoundIndex) {
        return pick.team._id == team._id
      }

      return false;
    });
  }

  teamAlreadyUsed(team): boolean {
    // TODO: Number of times a team can be selected should be provided by the server.
    const countAllowed = 1;
    return this.picksWithTeam(team).length >= countAllowed;
  }

  /**
   * 1. Below required picks and selecting game with no picks
   * 2. Below required picks and selecting other team for game (Switch picks)
   * 3. Met required picks
   * 4. Already pick team
   */
  selectedTeam(team) {
    const entry = this.props.entry;
    const game = this.props.game;
    const pick = this.props.pick;
    const title = `Selected ${team.displayName}`;

    if (pick) {
      if (pick.team._id == team._id) {
        this._deletePick(entry, title, pick);
      } else {
        const otherTeam = pick.team._id == game.awayTeam._id ? game.homeTeam : game.awayTeam;
        this._switchPick(entry, pick, otherTeam, game);
      }
    } else {
      this._createPick(entry, title, {
        team: team._id,
        game: game._id
      });
    }
  }

  selectedGolfer(golfer) {
    const entry = this.props.entry;
    const pick = this.props.pick;
    const title = `${golfer.name.first} ${golfer.name.last}`;

    if (pick) {
      if (pick.golfer._id == golfer._id) {
        this._deletePick(entry, title, pick);
      }
    } else {
      this._createPick(entry, title, {
        golfer: golfer._id
      });
    }
  }

  _deletePick(entry, title, pick) {
    const onPress = async () => {
      if (this.props.onUpdateCallback) {
        var _pick = await managerDeletePick(entry, pick, this.props.auth.token);
        this.props.onUpdateCallback(entry, _pick, 'delete')
      } else {
        this.props.dispatch(deletePick(entry, pick, this.props.auth.token));
        
        this.props.dispatch({
          type: 'SHOW_ACTIVITY_INDICATOR',
          text: 'Removing pick...'
        });
      }
    };

    if (Platform.OS === 'android') {
      return Alert.alert(
        title,
        '',
        [
          { text: 'Cancel' },
          { text: 'Remove Pick', onPress: onPress }
        ]
      )
    }

    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Cancel', 'Remove Pick'],
      cancelButtonIndex: 0,
      destructiveButtonIndex: 1,
      title: title
    }, (buttonIndex) => {
      if (buttonIndex == 1) {
        onPress();
      }
    })
  }

  _switchPick(entry, pick, otherTeam, game) {
    const title = `Selected ${otherTeam.displayName}`;

    const onPress = async () => {
      if (this.props.onUpdateCallback) {
        var _pick = await managerSwitchPick(entry, pick, otherTeam, game, this.props.auth.token);
        
        this.props.onUpdateCallback(entry, _pick, 'switch')
      } else {
        this.props.dispatch(switchPick(entry, pick, otherTeam, game, this.props.auth.token));
        this.props.dispatch({
          type: 'SHOW_ACTIVITY_INDICATOR',
          text: 'Switching pick...'
        });
      }
    };

    if (Platform.OS === 'android') {
      return Alert.alert(
        title,
        '',
        [
          { text: 'Cancel' },
          { text: 'Switch Pick', onPress: onPress }
        ]
      )
    }

    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Cancel', 'Switch Pick'],
      cancelButtonIndex: 0,
      title: title
    }, (buttonIndex) => {
      if (buttonIndex == 1) {
        onPress();
      }
    })
  }

  _createPick(entry, title, params) {
    const options = ['Cancel', 'Confirm Pick'];

    const onPress = async () => {
      if (this.props.onUpdateCallback) {
        var _pick = await managerCreatePick(entry, params, this.props.auth.token);
        this.props.onUpdateCallback(entry, _pick, 'create')
      } else {
        this.props.dispatch(createPick(entry, params, this.props.auth.token))
        this.props.dispatch({
          type: 'SHOW_ACTIVITY_INDICATOR',
          text: 'Confirming pick...'
        });
      }
    };

    if (Platform.OS === 'android') {
      return Alert.alert(
        title,
        '',
        [
          { text: 'Cancel' },
          { text: 'Confirm Pick', onPress: onPress }
        ]
      )
    }

    ActionSheetIOS.showActionSheetWithOptions({
      options: options,
      cancelButtonIndex: 0,
      title: title
    }, (buttonIndex) => {
      if (buttonIndex == 1) {
        onPress();
      }
    })
  }
}

const styles = StyleSheet.create({
  selection: {
    marginRight: 10
  },
  emptySelection: {
    width: 22,
    height: 22,
    marginRight: 10
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10
  },
  status: {
    color:'#999',
    marginRight: 10,
    textAlign: 'center',
    fontSize: 12,
    flexShrink: 1,
    width: 60
  },
  usedRound: {
    fontSize: 11,
    marginLeft: -6,
    marginRight: 2
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 7
  }
})

const select = (store) => {
  return store
}

export default connect(select)(GameView)
