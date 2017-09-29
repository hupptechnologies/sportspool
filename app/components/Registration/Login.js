import React from 'react';
import { connect } from 'react-redux';
import {
  Dimensions,
  Linking,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  Navigator
} from 'react-native';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalButton,
  SPModalFooter
} from '../../common/SPModal';
import { Text, SPText, SPTextHeading1, SPTextHeading2 } from '../../common/SPText';
import SPButton from '../../common/SPButton';
import SPTextField from '../../common/SPTextField';
import SignupUserForm from './SignupUserForm';
import {
  login
} from '../../actions';
import ActivityIndicator from '../ActivityIndicator';

import { sendPasswordResetLink, resetPassword } from '../../actions/login';

class Login extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      email: null,
      password: null,
      confirmPassword: null,
      code: null,
      codeSent: false
    };
  }

  login() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Logging in...'
    });

    this.props.dispatch(login(this.state.email, this.state.password));
  }

  resetPassword() {
    const {
      email,
      code,
      password,
      confirmPassword
    } = this.state;

    if (code == "") {
      alert('Please enter the validation code emailed to you.');
    } else if (password != confirmPassword) {
      alert('Both passwords must match.');
    } else {
      this.props.dispatch({
        type: 'SHOW_ACTIVITY_INDICATOR',
        text: 'Resetting password...'
      });

      resetPassword(
        email,
        code,
        password,
        confirmPassword
      ).then(user => {
        this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR' });
        this.login();
      }).catch(err => {
        this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR' });
        alert(err.message)
      });
    }
  }

  sendPasswordResetLink() {
    const { email } = this.state;

    if (email == "") {
      return alert("Please enter your email and we'll send a confirmation email.");
    }

    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Sending email'
    });

    sendPasswordResetLink(email).then(() => {
      this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR' });
      this.setState({ codeSent: true });
    }).catch(err => {
      this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR' });
      alert(err.message)
    });
  }

  focusTextField(ref) {
    this.refs[ref].refs['textInput'].focus()
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={
            <SPModalButton
              title={"Close"}
              onPress={this.props.onClose} />
          }
          title="Log in"
          rightComponent={
            <SPModalButton
              title={this.state.codeSent ? "Submit" : "Log in"}
              onPress={() => this.state.codeSent ? this.resetPassword() : this.login()} />
          }
        >
          <View style={{padding: 20}}>
            <Text styleName="h1 white center">
              Log in with your email address.
            </Text>
          </View>
        </SPModalHeader>
        <SPModalBody>

          {this.state.codeSent ?
            <View>
              <SPTextField
                label="Validation Code"
                placeholder="Enter the code sent to your email"
                onChangeText={t => this.setState({ code: t })}
                value={this.state.code}
                autoCorrect={false}
                autoFocus={true}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => this.focusTextField('password')}
              />
              <SPTextField
                ref="password"
                label="Password"
                placeholder=""
                onChangeText={t => this.setState({ password: t })}
                value={this.state.password}
                returnKeyType="next"
                secureTextEntry={true}
                onSubmitEditing={() => this.focusTextField('confirmPassword')}
              />
              <SPTextField
                ref="confirmPassword"
                label="Confirm Password"
                placeholder=""
                onChangeText={t => this.setState({ confirmPassword: t })}
                value={this.state.confirmPassword}
                returnKeyType="done"
                secureTextEntry={true}
                onSubmitEditing={() => this.resetPassword()}
              />
            </View>
            :
            <View>
              <SPTextField
                label="Email"
                placeholder="Enter a valid email address"
                onChangeText={t => this.setState({ email: t })}
                value={this.state.email}
                keyboardType="email-address"
                autoCorrect={false}
                autoFocus={true}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => this.refs['password'].refs['textInput'].focus()}
              />
              <SPTextField
                ref="password"
                label="Password"
                placeholder=""
                onChangeText={t => this.setState({ password: t })}
                value={this.state.password}
                returnKeyType="done"
                secureTextEntry={true}
                onSubmitEditing={() => this.login()}
              />

              <View style={styles.buttonContainer}>
                <SPButton
                  type="small gray"
                  title="Forgot Password?"
                  style={styles.button}
                  onPress={() => this.sendPasswordResetLink()}
                />
              </View>
            </View>
          }

          <ActivityIndicator
            animate={this.props.activityIndicator.show}
            text={this.props.activityIndicator.text}
          />

        </SPModalBody>
      </SPModal>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'stretch', // forces the view to be full-width
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30
  },
  button: {
    width: 160
  }
});

export default connect((store) => {
  return store;
})(Login);
