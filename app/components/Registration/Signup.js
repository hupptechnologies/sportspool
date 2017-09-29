import React from 'react';
import { connect } from 'react-redux';
import {
  Dimensions,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  Navigator,
  DeviceEventEmitter,
  Keyboard
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
import ActivityIndicator from '../ActivityIndicator';
import {
  sendSignupVerificationLink,
  verifySignupLink,
  signup
} from '../../actions'

class Signup extends React.Component {

  constructor(props) {
    super(props);

    // Tracks the current step of the registration process.
    this.currentRouteIndex = 0;

    this.state = {
      routes: [{
        index: 0,
        title: 'Enter your email address.',
        subtitle: 'We will send you an email for verification.',
        button: 'Verify'
      }, {
        index: 1,
        title: 'Check your email',
        subtitle: 'Tap or copy and paste the link contained within to complete verification.',
        button: 'Resend Link'
      }, {
        index: 2,
        title: 'Complete your registration',
        subtitle: 'Your email address has been verified',
        button: 'Register'
      }],
      // Link sent to user's email or SMS
      verificationLinkSent: false,
      // Flag to determine if user verified phone or email
      methodVerified: false,
      // User's registration info
      user: {
        firstName: null,
        lastName: null,
        phone: null,
        email: null,
        password: null,
        verificationLink: null
      },
      verificationLink: null,
      disableSubmit: true
    };
  }

  componentWillMount() {
    const sub = DeviceEventEmitter.addListener('Signup', (link) => {
      this.setState({
        user: { ...this.state.user, verificationLink: link },
        methodVerified: true
      });

      this.toNextStep();
    });

    this.setState({
      propsSubscriber: sub
    });
  }

  componentWillUnmount() {
    this.state.propsSubscriber.remove();
  }

  submitButtonPressed() {
    switch (this.currentRouteIndex) {
      case 0:
        this.sendVerificationLink();
        break;
      case 2:
        this.props.dispatch(signup(this.state.user));
        break;
      default:
        break;
    }
  }

  async sendVerificationLink() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Sending email...'
    });

    try {
      const res = await sendSignupVerificationLink({
        email: this.state.user.email
      });

      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });

      this.setState({
        verificationLinkSent: true
      });

      this.toNextStep()

    } catch(err) {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });

      this.setState({
        verificationLinkSent: false
      });

      alert(err.message);
    }

  }

  toNextStep() {
    this.currentRouteIndex++;
    this.refs.navigator.push(this.state.routes[this.currentRouteIndex]);
  }

  toPreviousStep() {
    this.currentRouteIndex--;
    this.refs.navigator.pop();
  }

  updateUserRecord(obj) {
    const newRecord = {...this.state.user, ...obj}
    this.setState({
      user: newRecord
    })
  }

  render() {
    return (
      <Navigator
        ref="navigator"
        initialRoute={this.state.routes[0]}
        initialRouteStack={this.state.routes}
        renderScene={(r,n) => this.renderScene(r,n)}
        configureScene={(route) => {
          return Navigator.SceneConfigs.HorizontalSwipeJump;
        }}
      />
    )
  }

  renderScene(route, navigator) {
    const isRoot = route.index == 0;
    const action = isRoot ? this.props.onClose : () => this.toPreviousStep();

    return (
      <SPModal>
        <SPModalHeader
          leftComponent={
            <SPModalButton
              title={isRoot ? "Close" : "Back"}
              onPress={action} />
          }
          title="Register"
          rightComponent={
            <SPModalButton
              title={route.button}
              onPress={() => this.submitButtonPressed()} />
          }
        >
          <View style={{padding: 20}}>
            <Text styleName="h1 white center">
              {route.title}
            </Text>
            <Text styleName="h2 translucent center" style={{ marginTop: 10 }}>
              {route.subtitle}
            </Text>
          </View>
        </SPModalHeader>
        <SPModalBody>
          {this.routeContent(route.index)}
        </SPModalBody>
        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.text}
        />
      </SPModal>
    )
  }

  routeContent(idx) {
    if (idx == 0) {
      return (
        <SPTextField
          label="Email"
          placeholder="Enter a valid email address"
          keyboardType="email-address"
          returnKeyType="send"
          autoCorrect={false}
          autoFocus={true}
          autoCapitalize="none"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            Keyboard.dismiss();
            this.submitButtonPressed();
          }}
          onChangeText={t => this.setState({
            user: { ...this.state.user, email: t }
          })}
        />
      )
    } else if (idx == 1) {
      return (
        <SPTextField
          label="Verification link"
          placeholder="Enter the verification link"
          returnKeyType="send"
          autoCorrect={false}
          autoFocus={true}
          autoCapitalize="none"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            var link = this.state.verificationLink;
            if (link == null) {
              return alert('Copy and paste the link in the email.');
            }

            var good = link.match(/verify/) != null;

            if (good) {
              this.setState({
                user: { ...this.state.user, verificationLink: this.state.verificationLink },
                methodVerified: true
              });

              this.toNextStep();

              Keyboard.dismiss();
            } else {
              return alert('Incorrect verification link.');
            }
          }}
          value={this.state.verificationLink}
          onChangeText={t => this.setState({
            verificationLink: t
          })}
        />
      )
    } else if (idx == 2) {
      return (
        <SignupUserForm
          user={this.state.user}
          onChangeText={(obj) => this.updateUserRecord(obj)}
          onFinish={() => {
            Keyboard.dismiss();
            this.submitButtonPressed();
          }}
        />
      )
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'stretch', // forces the view to be full-width
  }
});

export default connect((store) => {
  return store;
})(Signup);
