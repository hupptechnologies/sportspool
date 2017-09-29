import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  View,
  Image,
  StyleSheet,
  ListView,
  DeviceEventEmitter
} from 'react-native';

import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';

import {
  SPText,
  SPMediumText
} from '../../common/SPText';

import _ from 'underscore'
import { loadUsersEntries, groupEntries } from '../../actions/manager';
import EntryListView from '../EntryListView';
import UserInfo from './Info';
import SPButton from '../../common/SPButton';
import ActivityIndicator from '../ActivityIndicator';
import { createThread } from '../../actions/thread';

class UserProfile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      entries: []
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: "Fetching entries..."
    });

    this.loadUsersEntries();
  }

  componentWillMount() {
    const sub = DeviceEventEmitter.addListener('UserProfile', () => {
      this.loadUsersEntries();
      this.props.dispatch({
        type: 'SHOW_ACTIVITY_INDICATOR',
        text: "Updating entries..."
      });
    });

    this.setState({
      propsSubscriber: sub
    });
  }

  componentWillUnmount() {
    this.state.propsSubscriber.remove();
  }

  loadUsersEntries() {
    loadUsersEntries(
      this.props.pool._id,
      this.props.user._id,
      this.props.token
    ).then(json => {
      this.setState({
        entries: groupEntries(json.data)
      });

      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
    }).catch(err => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });

      alert(err.message);
    });
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
          title="Profile"
          rightComponent={<SPModalButton title="Chat" onPress={() => this.openChat()}/>}
        >
          <UserInfo user={this.props.user} />
        </SPModalHeader>
        <SPModalBody>
          <EntryListView
            pool={this.props.pool}
            data={this.state.entries}
            navigator={this.props.navigator}
            onEntryStatusChange={(e,s) => this.onEntryStatusChange(e,s)}
          />
        </SPModalBody>
        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.loadingText}
        />
      </SPModal>
    )
  }

  onEntryStatusChange(entries, status) {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: "Updating entries..."
    });

    this.loadUsersEntries();
  }

  openChat() {
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: "Opening chat..."
    });

    createThread(this.props.pool, { user: this.props.user._id }, this.props.token)
      .then(json => {
        this.props.dispatch({
          type: 'HIDE_ACTIVITY_INDICATOR'
        });

        this.props.dispatch({
          type: 'ADD_THREADS',
          threads: [json.thread]
        });

        this.props.navigator.push({
          directMessage: true,
          thread: json.thread,
          pool: this.props.pool,
          title: `Chat w/ ${this.props.user.name.first} ${this.props.user.name.last}`,
          user: this.props.user
        });
      })
      .catch(err => {
        this.props.dispatch({
          type: 'HIDE_ACTIVITY_INDICATOR'
        });

        alert(err.message);
      });

  }

  dismiss() {
    this.props.navigator.pop()
  }

}

export default connect((store) => {
  return {
    token: store.auth.token,
    activityIndicator: store.activityIndicator
  };
})(UserProfile);
