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
import SPTextField from '../../../common/SPTextField';

class DetailsView extends React.Component {

  render() {
    return (
      <ScrollView>
        <SPTextField
          ref={i => this.poolName = i}
          label="Pool Name"
          placeholder="Enter a pool name"
          value={this.props.name}
          returnKeyType="next"
          blurOnSubmit={false}
          onChangeText={t => this.props.onNameChange(t)}
          onSubmitEditing={() => {
            this.poolDescription.refs['textInput'].focus();
          }} />
          <SPTextField
            ref={i => this.poolDescription = i}
            label="Pool Description"
            placeholder="Enter a pool description"
            value={this.props.description}
            multiline={true}
            onChangeText={t => this.props.onDescriptionChange(t)}
          />
          <Text styleName="muted small" style={{ paddingHorizontal: 20, paddingTop: 15 }}>
            Pool description supports Markdown syntax (e.g. **bold text** and _italic text_)
          </Text>
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

export default DetailsView;