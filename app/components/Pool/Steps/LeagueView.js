import React from 'react';
import {
  View,
  ScrollView,
  Linking,
  StyleSheet
} from 'react-native';

import SPButton from '../../../common/SPButton';
import InputRadio from '../../../common/InputRadio';
import { Text, SPMediumText, SPText, SPBoldText } from '../../../common/SPText';
import SectionHeader from '../../../common/SectionHeader';

class LeagueView extends React.Component {

  render() {
    return (
      <View>
        <ScrollView>
          {this.props.available.length > 0 ?
            <View>
              <SectionHeader leftLabel="Available Now" />
              {this.props.available.map((object, idx) => {
                const selected = this.props.isSelected(object);
                return (
                  <InputRadio
                    key={`Available League ${idx}`}
                    title={this.getAvailableTitle(object)}
                    description={object.description || ""}
                    selected={selected}
                    onPress={() => {
                      this.props.onSelection(object, selected);
                    }}
                  />
                )
              })}
            </View>
            : null
          }
          
          {this.props.comingSoon.length > 0 ?
            <View>
              <SectionHeader leftLabel="Coming Soon"/>
              {this.props.comingSoon.map(title => {
                return (
                  <InputRadio
                    key={`Coming Soon Input Radio ${title}`}
                    title={title}
                    description=""
                    hideSelection={true}
                    onPress={() => {}}
                  />
                )
              })}

              <View style={styles.suggestContainer}>
                <Text styleName="medium">Suggestions</Text>
                <Text style={styles.suggestText}>Tell us what sports and games you would like.</Text>
                <SPButton title="Contact Us" onPress={() => {
                  var url = 'mailto:thesportspool@honormountain.com?subject=Suggestions';
                  Linking.canOpenURL(url).then(supported => {
                    if (supported) {
                      Linking.openURL(url);
                    } else {
                      alert('Unable to open mail client.');
                    }
                  });
                }} />
              </View>
            </View>
            : null}
          </ScrollView>
        </View>
    );
  }

  getAvailableTitle(object) {
    // PGA
    if (object.tournament) {
      return `⛳️ ${object.league}: ${object.tournament.name}`;
    }

    if (object.league == 'NCAAB') {
      return `🏀 ${object.league}`;
    }

    if (object.league == 'NFL') {
      return `🏈 ${object.league}`
    }

    return object.league;
  }

}

const styles = StyleSheet.create({
  suggestContainer: {
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    borderRadius: 6,
    padding: 15,
    margin: 15
  },
  suggestText: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10
  }
});

export default LeagueView;