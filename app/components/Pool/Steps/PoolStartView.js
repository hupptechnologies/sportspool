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
import KeyboardSpacer from 'react-native-keyboard-spacer';
import moment from 'moment';

class PoolStartView extends React.Component {

  render() {
    return (
      <ScrollView>
        <SPMediumText style={styles.inputTitle}>
          Pool Start
        </SPMediumText>
        {this.props.dates.map((date, idx) => {
          const selected = this.props.isSelected(date.date);
          return (
            <InputRadio
              key={`Pool Start ${date.date}`}
              title={date.name}
              description={`Starts ${moment(date.date).format('dddd, MMM Do')}`}
              selected={selected}
              onPress={() => {
                this.props.onSelection(date, date.week, selected);
              }}
            />
          )
          return <Text key={date.date}>{date.date}</Text>
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

export default PoolStartView;