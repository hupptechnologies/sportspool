import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView
} from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SPTextField from '../../common/SPTextField';
import KeyboardHandler from '../KeyboardHandler';

export default class SignupUserForm extends React.Component {

  focusNextField = (nextField) => {
    const ref = this.refs[nextField];
    if (ref) {
      ref.refs['textInput'].focus();
    }
  }

  render() {
    return (
      // <KeyboardHandler>
        <ScrollView>
          <SPTextField
            ref="1"
            label="First Name"
            placeholder="Enter your first name"
            returnKeyType="next"
            blurOnSubmit={false}
            autoFocus={true}
            onChangeText={t => this.props.onChangeText({firstName: t})}
            onSubmitEditing={() => this.focusNextField('2')} />
          <SPTextField
            ref="2"
            label="Last Name"
            placeholder="Enter your last name"
            returnKeyType="next"
            blurOnSubmit={false}
            onChangeText={t => this.props.onChangeText({lastName: t})}
            onSubmitEditing={() => this.focusNextField('4')} />
          <SPTextField
            ref="3"
            label="Email"
            placeholder="Enter a valid email address"
            value={this.props.user.email}
            keyboardType="email-address"
            editable={false}
            blurOnSubmit={false}
            onChangeText={t => this.props.onChangeText({email: t})}
            returnKeyType="next" />
          <SPTextField
            ref="4"
            label="Password"
            placeholder="Enter a password"
            secureTextEntry={true}
            blurOnSubmit={false}
            onChangeText={t => this.props.onChangeText({password: t})}
            onSubmitEditing={() => this.props.onFinish()}
            returnKeyType="send" />
            <KeyboardSpacer />
        </ScrollView>
      // </KeyboardHandler>
    )
  }
}

const styles = StyleSheet.create({

})
