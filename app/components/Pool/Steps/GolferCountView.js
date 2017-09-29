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

class GolferCountView extends React.Component {

  render() {
    return (
      <ScrollView>
        <SPMediumText style={styles.inputTitle}>
          Groups
        </SPMediumText>
        <SPMediumText style={[
          styles.inputTitle, {
            color: '#333',
            marginBottom: 10
          }]}
        >
          A total of 10 golfers is required.
        </SPMediumText>
        {this.props.groups.map((option, idx) => {
          return (
            <SPTextFieldInline
              key={`group${idx}`}
              label={option.name}
              value={`${option.count}`}
              placeholder={`${option.count}`}
              keyboardType={"numeric"}
              onChange={event => {
                this.props.onChange(option, event.nativeEvent.text);
              }}
            />
          )
        })}
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

export default GolferCountView;