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
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SPTextFieldInline from '../../../common/SPTextFieldInline';

class WinnerCountView extends React.Component {

  render() {
    return (
      <ScrollView>
        <SPMediumText style={styles.inputTitle}>

        </SPMediumText>
        <SPTextFieldInline
          label={"Number of winners"}
          value={`${this.props.numWinners}`}
          keyboardType={"numeric"}
          onChange={event => {
            this.props.onChange(event.nativeEvent.text);
          }}
        />
        <KeyboardSpacer />
      </ScrollView>
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

export default WinnerCountView;