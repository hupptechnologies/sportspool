import React, { Component } from 'react'
import {
  ScrollView,
  StyleSheet,
  View
} from 'react-native'

import { SPText, SPMediumText } from '../../common/SPText'
import SPInlineInfoLabel from '../../common/SPInlineInfoLabel'
import moment from 'moment'

export default class InvitationRulesSection extends Component {
  render() {
    const box = this.props.pool.style == 'Survivor' ? (
      <View style={styles.container}>
        <SPMediumText style={styles.boxTitle}>
          Picks Per Round
        </SPMediumText>
        <SPText style={styles.boxDescription}>
          Rounds may be based on the number of survivors entering that round.
        </SPText>

        {this.props.pool.rounds.map((obj, idx) => {
          return (
            <View key={idx} style={{marginBottom:5}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
                <SPMediumText style={{color: '#999', fontSize: 14}}>{obj.name}</SPMediumText>
                <SPMediumText style={{color: '#333', fontSize: 14}}>
                  {obj.count}
                  {obj.numSurvivors ?
                  <SPText> or {obj.maxCount} (>= {obj.numSurvivors})</SPText>
                  : null}
                </SPMediumText>
              </View>
            </View>
          )
        })}
      </View>
    ) : (
      <View style={styles.container}>
        <SPMediumText style={styles.boxTitle}>
          Golfers Per Group
        </SPMediumText>
        <SPText style={styles.boxDescription}>
          Number of golfers to pick for each group.
        </SPText>
        {this.props.pool.groups.map((obj, idx) => {
          return (
            <View key={idx} style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
              <SPMediumText style={{color: '#999', fontSize: 14}}>Group {obj.name}</SPMediumText>
              <SPMediumText style={{color: '#333', fontSize: 14}}>{obj.count}</SPMediumText>
            </View>
          )
        })}
      </View>
    );

    return (
      <ScrollView style={this.props.style}>
        <SPMediumText style={{
          textAlign: 'center',
          marginBottom: 10
        }}>
          How to play
        </SPMediumText>

        <SPText>
          {this.props.pool.howToPlay}
        </SPText>

        {box}

      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  infoLabel: {
    marginHorizontal: -20
  },
  container: {
    backgroundColor: '#F6F6F6',
    padding: 20,
    marginVertical: 20,
    borderRadius: 6
  },
  boxTitle: {
    textAlign: 'center'
  },
  boxDescription: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 15,
    marginTop: 7
  }
})
