import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput
} from 'react-native';

import SPButton from '../../../common/SPButton';
import InputRadio from '../../../common/InputRadio';
import { Text, SPMediumText, SPText, SPBoldText } from '../../../common/SPText';
import SectionHeader from '../../../common/SectionHeader';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SPTextFieldInline from '../../../common/SPTextFieldInline';
import Border from '../../../common/Border';

import moment from 'moment';

class PickCountView extends React.Component {

  constructor(props) {
    super(props);
    // Show advanced settings if any round has `basedOnSurvivors`
    this.state = {
      showAdvancedSettings: props.rounds.filter(round => round.basedOnSurvivors).length > 0
    };
  }

  render() {
    return (
      <ScrollView style={{ padding: 20 }}>
        <Text styleName="muted medium">
          {this.state.showAdvancedSettings ? "Picks Based On: Week AND Survivors" : "Picks Players Make Per Week"}
        </Text>

{this.props.rounds.map((round, idx) => {
  var on = round.basedOnSurvivors;

  return (
    <View key={`advanced round ${idx}`} style={{ marginTop: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text styleName="h2">{round.name}</Text>
        {this.state.showAdvancedSettings && on ? null : (
          <TextInput
            underlineColorAndroid="rgba(0,0,0,0)"
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              fontFamily: 'Avenir',
              fontWeight: '500',
              textAlign: 'right',
              fontSize: 18
            }}
            value={`${round.count}`}
            keyboardType={"numeric"}
            onChange={event => {
              var text = event.nativeEvent.text;
              var r = { ...round, count: text};
              this.props.onChange(r, idx);
            }}
          />
        )}
      </View>

      <Text styleName="muted" style={{ marginTop: 5 }}>Starts {moment(round.start).format('ddd, MMM D')}</Text>

      {this.state.showAdvancedSettings &&
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        {on ?
          <Text>Set picks per survivors</Text>
        :
          <Text>Set picks per survivors remaining</Text>
        }
        <Switch
          value={on}
          onValueChange={(value) => {
            var r = {...round};
            if (!value) {
              r.numSurvivors = null;
              r.maxCount = null;
            } else {
              r.numSurvivors = 0;
              r.maxCount = 1;
            }

            r.basedOnSurvivors = value;

            this.props.onChange(r, idx);
          }}
        />
        </View>
      }

      {on && this.state.showAdvancedSettings &&
      <View style={{ marginHorizontal: -20 }}>
       <SPTextFieldInline
          label={"If survivors are greater or equal to:"}
          value={`${round.numSurvivors}`}
          keyboardType={"numeric"}
          onChange={event => {
            var text = event.nativeEvent.text;
            var r = { ...round, numSurvivors: text};
            this.props.onChange(r, idx);
          }}
        />
        <SPTextFieldInline
          label={"Picks players make:"}
          value={`${round.maxCount}`}
          keyboardType={"numeric"}
          onChange={event => {
            var text = event.nativeEvent.text;
            var r = { ...round, maxCount: text};
            this.props.onChange(r, idx);
          }}
        />
        <SPTextFieldInline
          label={"If survivors are less than:"}
          value={`${round.numSurvivors}`}
          keyboardType={"numeric"}
          onChange={event => {
            var text = event.nativeEvent.text;
            var r = { ...round, numSurvivors: text};
            this.props.onChange(r, idx);
          }}
        />
        <SPTextFieldInline
          border={false}
          label={"Picks players make:"}
          value={`${round.count}`}
          keyboardType={"numeric"}
          onChange={event => {
            var text = event.nativeEvent.text;
            var r = { ...round, count: text};
            this.props.onChange(r, idx);
          }}
        />
      </View>
      }
      <Border style={{ marginTop: 10, marginHorizontal: -20 }} />
    </View>
  );
})}

<View style={{ marginVertical: 20 }}>
  <Text styleName="muted">Advanced Settings</Text>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
    <Text>Set picks per survivors remaining</Text>
    <Switch
      value={this.state.showAdvancedSettings}
      onValueChange={(value) => {
        this.setState({
          showAdvancedSettings: value
        });
      }}
    />
  </View>
</View>

        <KeyboardSpacer />
      </ScrollView>
    );
  }

}

const styles = StyleSheet.create({

});

export default PickCountView;
