import React from 'react';
import {
  View,
  StyleSheet,
  Image
} from 'react-native';
import { Text, SPMediumText, SPText } from '../../common/SPText';
import PickItem from '../PickItem';

export default class PickOverviewItem extends React.Component {
  render() {
    var left = null;

    if (this.props.item.teams !== undefined) {
      left = (
        <View style={{flexDirection: 'row'}}>
          {this.props.item.teams.map((team, idx) => {
            if (team == '') {
              return (
                <View style={[styles.pick, styles.missingPick]} key={idx}>
                  <Text style={{fontSize: 34}}>❓</Text>
                </View>
              )
            }

            return <PickItem key={team._id} id={team._id} logo={team.logo} alias={team.abbr} />
          })}
        </View>
      );
    } else if (this.props.item.golfer !== undefined) {
      var golfer = this.props.item.golfer;
      var score = golfer.status == "cut" ? "CUT" : golfer.total == 0 ? "E" : golfer.total > 0 ? `+${golfer.total}` : `${golfer.total}`;
      left = (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image style={{ width: 32, height: 32, marginRight: 10 }} source={{uri: golfer.thumbnail}} />
          <SPMediumText>
            {golfer.name.first} {golfer.name.last}
          </SPMediumText>
          <Text styleName="muted" style={{ paddingLeft: 6 }}>
            {score}
          </Text>
        </View>
      );
    } else {
      left = (
        <View>
          <SPMediumText style={styles.title}>
            {this.props.item.title}
          </SPMediumText>
          <SPText style={styles.description}>
            {this.props.item.description}
          </SPText>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {left}
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <SPMediumText style={styles.count}>
            {this.props.item.count}
          </SPMediumText>
          <SPMediumText style={styles.percentage}>
            {this.props.item.percentage}%
          </SPMediumText>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  title: {
    color: '#333',
    fontSize: 16
  },
  description: {
    color: '#999',
    fontSize: 14
  },
  count: {
    color: '#333',
    fontSize: 16,
    marginLeft: 10
  },
  percentage: {
    color: '#999',
    fontSize: 16,
    width: 60,
    textAlign: 'right'
  },
  pick: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    backgroundColor: 'transparent'
  },
  missingPick: {
    width: 40
  }
})
