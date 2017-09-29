import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  DeviceEventEmitter,
  ListView,
  StyleSheet,
  Platform,
  View
} from 'react-native';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';
import Border from '../../common/Border';
import Thread from './Thread';
import AndroidPicker from '../AndroidPicker';
import { Text } from '../../common/SPText';
import { getThreads, createThread, GROUPS, PGA_GROUPS } from '../../actions/thread';
import _ from 'underscore';
import moment from 'moment';

class ChatConversations extends Component {

  constructor(props) {
    super(props);

    const managerID = props.pool.manager._id || props.pool.manager;
    const threads = props.threads.filter(t => t.pool._id == props.pool._id);

    this.state = {
      threads: threads,
      isManager: props.user._id == managerID,
      showAndroidPicker: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }).cloneWithRows(this.sortThreads(threads))
    };
  }

  componentDidMount() {
    const token = this.props.auth.token;
    const pool = this.props.pool;
    this.props.dispatch(getThreads(pool, token));

    this._pollingInterval = setInterval(() => {
      this.props.dispatch(getThreads(pool, token));
    }, 3000);
  }

  componentWillMount() {
    const sub = DeviceEventEmitter.addListener('ChatConversations', (threads) => {
      this.didReceiveNewThreads(this.sortThreads(threads))
    });

    this.setState({
      propsSubscriber: sub
    });
  }

  componentWillUnmount() {
    this.state.propsSubscriber.remove();
    clearInterval(this._pollingInterval);
  }

  didReceiveNewThreads(_threads) {
    const threads = _threads.filter(t => t.pool._id == this.props.pool._id);

    this.setState({
      threads,
      dataSource: this.state.dataSource.cloneWithRows(this.sortThreads(threads))
    });
  }

  sortThreads(threads) {
    return _.sortBy(threads, (thread) => {
      var comments = _.sortBy(thread.comments, (comment) => {
        return moment(comment.created).valueOf()
      });

      const comment = comments.pop();
      return moment(comment ? comment.created : thread.created).valueOf();
    }).reverse();
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
          title={this.props.pool.name}
          rightComponent={<SPModalButton icon="ios-add" onPress={() => this.showChatOptions()}/>}
        >
        </SPModalHeader>
        <SPModalBody>
        {this.state.threads.length > 0 ?
          <ListView
            removeClippedSubviews={false}
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            renderSeparator={(s, r) => {
              return <Border key={`sep:${s}:${r}`} />
            }}
            renderRow={t => {
              return <Thread thread={t} onPress={(t) => this.onPress(t)} />
            }}
          />
        :
          <View style={{ flex: 1, marginHorizontal: 30, justifyContent: 'center' }}>
            <Text styleName="h1 muted medium center">
              Tap the + button in the top right to start a conversation.
            </Text>
          </View>
        }
        </SPModalBody>
        {Platform.OS === 'android' &&
          <AndroidPicker
            onRequestClose={() => this.setState({ showAndroidPicker: false })}
            visible={this.state.showAndroidPicker}
            title="Chat Options"
            items={this.pickerItems()}
          />
        }
      </SPModal>
    )
  }

  onPress(thread) {
    var title = "";

    if (thread.group) {
      const keys = Object.keys(GROUPS);
      keys.forEach(key => {
        if (GROUPS[key] == thread.group) {
          title = `${key} Group`
        }
      });
    } else {
      var users = thread.to.filter(user => user._id != this.props.user._id);
      var user = users[users.length - 1];

      if (user) {
        title = `${user.name.first} ${user.name.last}`;
      }
    }

    this.props.navigator.push({
      directMessage: true,
      title: title,
      thread: thread,
      pool: thread.pool
    });
  }

  availableChatOptions() {
    if (this.state.isManager) {
      const array = this.props.pool.league.name == 'PGA' ? PGA_GROUPS : GROUPS;
      return Object.keys(array).map((key, index) => {
        return {
          title: key,
          onSelect: () => {
            const group = GROUPS[key];
            this.createThread({ group }, `Chat w/ ${key}`);
          }
        }
      });
    }

    return [{
      title: 'Message to your pool manager',
      onSelect: () => {
        const user = this.props.pool.manager;
        this.createThread({ user }, '');
      }
    }];
  }

  showChatOptions() {
    if (Platform.OS === 'android') {
      return this.setState({ showAndroidPicker: true });
    }

    const chatOptions = this.availableChatOptions();
    const options = [...['Cancel'], ...chatOptions.map(o => o.title)];

    ActionSheetIOS.showActionSheetWithOptions({
      options: options,
      cancelButtonIndex: 0
    }, (index) => {
      if (index > 0) {
        const func = chatOptions[index - 1];
        func.onSelect();
      }
    });
  }

  pickerItems() {
    return this.availableChatOptions().map((option, index) => {
      return {
        key: index,
        title: option.title,
        onPick: () => {
          this.setState({
            showAndroidPicker: false
          });

          option.onSelect();
        }
      }
    });
  }

  createThread(params, title) {
    createThread(this.props.pool, params, this.props.auth.token)
      .then(json => {
        this.props.dispatch({
          type: 'ADD_THREADS',
          threads: [json.thread]
        });

        this.props.navigator.push({
          directMessage: true,
          title: title,
          group: params.group,
          thread: json.thread,
          pool: this.props.pool
        });
      })
      .catch(err => {
        alert(err.message);
      });
  }

  dismiss() {
    this.props.navigator.pop()
  }

}

const styles = StyleSheet.create({

});

export default connect((store) => {
  return store;
})(ChatConversations);
