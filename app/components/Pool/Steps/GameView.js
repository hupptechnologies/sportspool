import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet
} from 'react-native';

import SPButton from '../../../common/SPButton';
import InputRadio from '../../../common/InputRadio';
import { Text, SPMediumText, SPText, SPBoldText } from '../../../common/SPText';
import SectionHeader from '../../../common/SectionHeader';

class GameView extends React.Component {

  render() {
    return (
      <View>
        <SPMediumText style={styles.inputTitle}>
          Games
        </SPMediumText>
        <InputRadio
          title={this.props.title}
          description={this.props.description}
          selected={true}
          onPress={() => {}}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  inputTitle: {
    color: '#999',
    paddingHorizontal: 20,
    paddingTop: 10
  }
});

export default GameView;