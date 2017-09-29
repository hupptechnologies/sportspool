import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import { SPMediumText, SPText } from './SPText';
import Border from './Border';
import InputRadio from './InputRadio';
import SPTextFieldInline from './SPTextFieldInline';
import KeyboardHandler from '../components/KeyboardHandler';
import _ from 'underscore';

export default class InputGroup extends Component {

  render() {
    var options = [];

    if (this.props.group == 'radio') {
      options = this.props.options.map((option, idx) => {
        return <InputRadio key={`InputRadio${idx}`} title={option.text} description={option.description} selected={_.isEqual(this.props.selectedValue, option)} onPress={selected => this.props.onPress(selected, option)} />
      });
    } else {
      options = this.props.options.map((option, idx) => {
        return <SPTextFieldInline key={`SPTextFieldInline:${idx}`} label={option.title} value={option.text} placeholder={option.placeholder} onChange={text => this.props.onChange(option)} />
      });
    }

    return (
      <KeyboardHandler>
        <View>
          <SPMediumText style={styles.title}>{this.props.title}</SPMediumText>
          {this.props.description &&
            <SPText style={styles.description}>{this.props.description}</SPText>
          }
          {options.map(o => o)}
        </View>
      </KeyboardHandler>
    );
  }

}

const styles = StyleSheet.create({
  title: {
    color: '#999',
    paddingHorizontal: 20,
    marginTop: 20
  },
  description: {
    color: '#999',
    paddingHorizontal: 20,
  }
});
