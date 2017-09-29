import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Image,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ActionSheetIOS,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import {
  Text,
  SPText,
  SPMediumText
} from '../../common/SPText';
import { deletePick, managerDeletePick } from '../../actions/entries';
import moment from 'moment';

const BUTTONS = [
  'Remove Pick',
  'Cancel',
];
const DESTRUCTIVE_INDEX = 0;
const CANCEL_INDEX = 1;

class EntryPickView extends Component {

  render() {
    const renderForGolf = this.props.type == 'golfer';

    const containerStyle = {
      height: renderForGolf ? 56 : 78
    };

    const logoStyle = {
      height: renderForGolf ? 34 : 48,
      width: renderForGolf ? 34 : 48
    };

    if (renderForGolf ? this.props.pick === undefined : this.props.game === undefined) {
      var text = renderForGolf ? `Group ${this.props.group.name}` : "Make Pick";
      return (
        <View style={[this.props.style, styles.container, styles.emptyContainer, containerStyle]}>
          <Text style={{fontSize: renderForGolf ? 14 : 16, color: '#B8D0EA'}}>
            {text}
          </Text>
        </View>
      )
    }

    var golfer = this.props.pick.golfer;
    var image = renderForGolf ? golfer.thumbnail : this.props.pick.team.logo;
    var topText = renderForGolf ? `${golfer.name.first[0]}. ${golfer.name.last}` : this.teamName();
    var bottomText = renderForGolf ? `Group ${this.props.group.name}` : `vs ${this.opponent()}`;

    // Team stuff
    const team = (
      <View style={styles.teamContainer}>
        <Image source={{uri: image}} style={[styles.logo, logoStyle]} />
        <View style={{justifyContent: 'center'}}>
          <SPMediumText style={[styles.teamName, { fontSize: renderForGolf ? 14 : 16 }]}>
            {topText}
          </SPMediumText>
          <SPText style={[styles.opponentName, { fontSize: renderForGolf ? 12 : 14 }]}>
            {bottomText}
          </SPText>
        </View>
      </View>
    );

    // Generate right side of card
    var side = null;

    const notLocked = renderForGolf ? !golfer.pastTeeTime : (this.props.game.status == 'pregame' && moment().isBefore(this.props.game.start))

    if (notLocked) {

      if (!renderForGolf) {
        side = (
          <View style={styles.side}>
            <SPText style={styles.lockLabel}>Pick locks in</SPText>
            <SPText style={styles.countdown}>{moment(this.props.game.start).fromNow()}</SPText>
          </View>
        );
      }

      return (
        <TouchableWithoutFeedback onPress={() => this.onRemove()}>
          <View style={[this.props.style, styles.container, styles.pickContainer, containerStyle]}>
            {team}
            {side}
            <Image source={require('../../common/images/x-green.png')} style={styles.close} />
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      var status = this.props.game.status;
      var teamScoreStyle = { fontSize: 14, color: '#999' };
      var oppScoreStyle = {...teamScoreStyle};
      var statusStyle = { fontSize: 12, color: '#999' };
      var statusText = status == 'inprogress' || status == 'pregame' ? (this.props.game.displayStatus || "") : this.pickWon() ? 'WON' : 'LOST';

      // Change score text styling based on which team won
      if (status == 'final') {
        var largeStyle = { fontSize: 16, color: '#333', fontWeight: '500' };
        if (this.pickWon()) {
          teamScoreStyle = {...teamScoreStyle, ...largeStyle};
        } else {
          oppScoreStyle = {...oppScoreStyle, ...largeStyle};
        }

        const color = this.pickWon() ? '#24B879' : '#E85D5D';
        statusStyle = {fontSize: 12, color: color, fontWeight: '900', textAlign: 'center'};
      }

      side = (
        <View style={{flexDirection: 'row'}}>
          <View style={styles.side}>
            <SPText style={teamScoreStyle}>{this.teamsScore()}</SPText>
            <SPText style={oppScoreStyle}>{this.opponentsScore()}</SPText>
          </View>
          <View style={{alignItems: 'center', justifyContent: 'center', paddingLeft: 15}}>
            <SPText style={statusStyle}>
              {statusText}
            </SPText>
          </View>
        </View>
      );

    }

    return (
      <View style={[this.props.style, styles.container, styles.pickContainer, containerStyle]}>
        {team}
        {side}
      </View>
    );

  }

  opponent() {
    return this.props.pick.team._id == this.props.game.awayTeam._id ? this.props.game.homeTeam.displayName : this.props.game.awayTeam.displayName;
  }

  teamName() {
    return this.props.pick.team._id == this.props.game.awayTeam._id ? this.props.game.awayTeam.displayName : this.props.game.homeTeam.displayName;
  }

  teamsScore() {
    return this.props.pick.team._id == this.props.game.awayTeam._id ? this.props.game.awayPoints : this.props.game.homePoints;
  }

  opponentsScore() {
    return this.props.pick.team._id == this.props.game.awayTeam._id ? this.props.game.homePoints : this.props.game.awayPoints;
  }

  pickWon() {
    return this.teamsScore() > this.opponentsScore()
  }

  onRemove() {
    const title = this.props.type == 'golfer' ? `Selected ${this.props.pick.golfer.name.first} ${this.props.pick.golfer.name.last}` : `Selected ${this.teamName()}`;

    const onPress = async () => {
      this.props.dispatch({
        type: 'SHOW_ACTIVITY_INDICATOR',
        text: 'Removing pick...'
      });

      if (this.props.onUpdateCallback) {
        var _pick = await managerDeletePick(this.props.entry, this.props.pick, this.props.auth.token);
        this.props.onUpdateCallback(this.props.entry, _pick, 'delete')

        this.props.dispatch({
          type: 'HIDE_ACTIVITY_INDICATOR',
        });
      } else {
        this.props.dispatch(deletePick(this.props.entry, this.props.pick, this.props.auth.token));
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
      options: BUTTONS,
      cancelButtonIndex: CANCEL_INDEX,
      destructiveButtonIndex: DESTRUCTIVE_INDEX,
      title: title
    }, (buttonIndex) => {
      if (buttonIndex == DESTRUCTIVE_INDEX) {
        onPress();
      }
    })
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  emptyContainer: {
    backgroundColor: 'rgba(0, 0, 0, .20)',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  pickContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 15
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 10
  },
  teamName: {
    fontSize: 16,
    color: '#333'
  },
  opponentName: {
    fontSize: 14,
    color: '#999'
  },
  lockLabel: {
    color: '#ccc',
    fontSize: 12
  },
  countdown: {
    color: '#999',
    fontSize: 12
  },
  close: {
    position: 'absolute',
    top: -7,
    right: -7
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  }
});

const select = (store) => {
  return store;
}

export default connect(select)(EntryPickView);
