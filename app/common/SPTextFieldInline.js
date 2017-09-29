import React from 'react';
import {
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { SPMediumText } from './SPText';
import Border from './Border';

export default class SPTextFieldInline extends React.Component {
  render() {
    return (
      <View>
        <View style={styles.container}>
          <SPMediumText style={styles.label}>
            {this.props.label}
          </SPMediumText>
          <TextInput
            underlineColorAndroid="rgba(0,0,0,0)"
            {...this.props}
            style={[styles.input, this.props.style]}
          />
        </View>
        {typeof this.props.border === 'boolean' && !this.props.border ? null : <Border /> }

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
  label: {
    color: '#999',
    flex: 1,
    justifyContent: 'flex-start'
  },
  input: {
    flex: 1,
    justifyContent: 'flex-end',
    fontFamily: 'Avenir',
    fontWeight: '500',
    textAlign: 'right',
    fontSize: 14
  }
});
