import React from 'react';
import { connect } from 'react-redux';
import {
  View,
  ListView,
  StyleSheet
} from 'react-native';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';
import {
  GiftedChat,
  Bubble,
  MessageText,
  Time,
  Day,
  Composer
} from 'react-native-gifted-chat';

import { createMessage, getThreadMessages } from '../../actions/thread';
import _ from 'underscore';

class DirectMessage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isManager: props.user._id == props.thread.pool.manager,
      messages: this.prepareMessages(props.thread.comments)
    };
  }

  componentDidMount() {
    getThreadMessages(
      this.props.thread.pool,
      this.props.thread,
      this.props.auth.token
    ).then(json => {
      this.setState({
        messages: this.prepareMessages(json.data)
      });
    }).catch(err => alert(err.message));
  }

  prepareMessages(comments) {
    return _.sortBy(comments.map(comment => {
      return {
        _id: comment._id,
        text: comment.message,
        createdAt: comment.created,
        user: {
          ...comment.sender,
          name: `${comment.sender.name.first} ${comment.sender.name.last[0] || ''}.`
        }
      }
    }), comment => comment.created).reverse()
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
          title={this.props.title}>
        </SPModalHeader>
        <SPModalBody>
          <GiftedChat
            messages={this.state.messages}
            renderBubble={p => this.renderBubble(p)}
            renderMessageText={p => this.renderMessageText(p)}
            renderTime={p => this.renderTime(p)}
            renderDay={p => this.renderDay(p)}
            renderComposer={p => this.renderComposer(p)}
            onSend={(m) => this.onSend(m)}
            user={this.props.user}
          />
        </SPModalBody>
      </SPModal>
    )
  }

  renderBubble(props) {
    return (
      <Bubble {...props} wrapperStyle={{
        left: { paddingTop: 0 },
        right: { paddingTop: 0 }
      }} />
    );
  }

  renderMessageText(props) {
    return <MessageText {...props} textStyle={{
      left: { fontFamily: 'Avenir' },
      right: { fontFamily: 'Avenir' }
    }} />
  }

  renderTime(props) {
    return <Time {...props} textStyle={{
      left: { fontFamily: 'Avenir' },
      right: { fontFamily: 'Avenir' }
    }} />
  }

  renderDay(props) {
    return <Day {...props} textStyle={{
      fontFamily: 'Avenir'
    }} />
  }

  renderComposer(props) {
    if (this.props.thread.group && !this.state.isManager) {
      return null;
    }

    return (
      <Composer
        {...props}
      />
    );
  }

  onSend(messages=[]) {
    const message = messages[0];
    if (!message) {
      return alert(new Error('Unable to send meesage.'));
    }

    this.props.dispatch(createMessage(this.props.thread, message.text, this.props.auth.token));

    this.setState({
      messages: GiftedChat.append(this.state.messages, messages),
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
})(DirectMessage);
