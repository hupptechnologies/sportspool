import React, { Component } from 'react';
import {
  AppState,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  Platform,
  DeviceEventEmitter
} from 'react-native';

import { connect } from 'react-redux';
import moment from 'moment';
import LandingScreen from './components/LandingScreen';
import Signup from './components/Registration/Signup';
import SPNavigator from './components/SPNavigator';
import branch from 'react-native-branch';
import Instabug from 'instabug-reactnative';

import { registerInvite, addLinkSubmission } from './actions/invitations';

import { updateUser } from './actions/user';
import PushNotificationsHandler from 'react-native-push-notification';

import { getEntries } from './actions/entries';
import { getInvitations } from './actions/invitations';
import { getPools } from './actions/pool';

class SPApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState
    };

    Instabug.startWithToken('ef0f055b0eed5f59769e70521c288480', Instabug.invocationEvent.shake);
    Instabug.setEmailFieldRequired(true);
    Instabug.setIntroMessageEnabled(false);

    // Subscribe to incoming links (both Branch & non-Branch)
    // bundle = object with: {params, error, uri}
    branch.subscribe((bundle) => {
      // Android: Branch params aren't being passed on Android, for whatever reasons, so create a simple Branch Link that has ?verify=1 appended.
      if (bundle && bundle.uri) {
        if (bundle.uri) {
          if (this.getUrlParameter(bundle.uri, 'verify')) {
            this.verifyRegistration(bundle.uri)
          } else if (this.getUrlParameter(bundle.uri, 'invite')) {
            this.registerInvite(bundle.uri);
          }
        }
      }
      // iOS
      else if (bundle && bundle.params) {
        if (bundle.params.verify) {
          this.verifyRegistration(bundle.uri)
        } else if (bundle.params.invite) {
          var uri = `https://thesportspool.app.link?invite=${bundle.params.invite}`;
          this.registerInvite(uri);
        }
      }

    })

    this.loadBranchParams();

    const onRegister = this.onRegister.bind(this);

    PushNotificationsHandler.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: onRegister,

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {

      },

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "501669867109",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
          alert: true,
          badge: true,
          sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: false,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: false,
    });
  }

  verifyRegistration(uri) {
    DeviceEventEmitter.emit('Signup', uri);
  }

  registerInvite(uri) {
    this.props.dispatch(addLinkSubmission(uri));

    // Submit links if user is logged in.
    if (this.props.auth.token) {
      const token = this.props.auth.token;
      const link = this.props.invitations.waitingSubmission;

      this.props.dispatch(registerInvite(token, link));
    }
  }

  async loadBranchParams() {
    let lastParams = await branch.getLatestReferringParams() // params from last open
    let installParams = await branch.getFirstReferringParams() // params from original install
  }

  getUrlParameter(uri, name) {
  	if (typeof uri !== 'string') {
  		return null;
    }

    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(uri);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    PushNotificationsHandler.setApplicationIconBadgeNumber(0);

    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      const token = this.props.auth.token;
      // Perform data refresh
      if (token) {
        this.props.dispatch(getEntries(token));
        this.props.dispatch(getInvitations(token));

        getPools(token).then(json => {
          this.props.dispatch({
            type: 'SET_POOLS', pools: json.data
          })
        });
      }
    }

    this.setState({ appState: nextAppState });
  }

  render() {
    const routes = [{}];

    if (!this.hasValidToken()) {
      return <LandingScreen />
    }

    return (
      <SPNavigator />
    );
  }

  hasValidToken() {
    const tkn = this.props.auth.token;
    return tkn;

    const exp = this.props.auth.expiration;
    return tkn && exp && moment(exp).isAfter();
  }

  onRegister(data) {
    this.props.dispatch(updateUser(this.props.user, { devToken: data.token, platform: Platform.OS }, this.props.auth.token));
  }
}

const select = (store) => {
  return store;
};

export default connect(select)(SPApp);
