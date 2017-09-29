import React from 'react';
import { connect } from 'react-redux';
import {
  Image,
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { SPText, SPMediumText } from '../../common/SPText';
import moment from 'moment';
import { GROUPS } from '../../actions/thread';

class Thread extends React.Component {

  render() {
    const recentComment = this.props.thread.comments[this.props.thread.comments.length-1] || {
      message: 'No new messages.',
      created: Date.now()
    };

    const text = recentComment.message;
    const date = moment(recentComment.created).format('M/D h:mm A');

    var name = this.props.thread.to.filter(user => {
      return user._id != this.props.user._id
    }).map(user => {
      return `${user.name.first} ${user.name.last}`
    }).join(', ');

    if (this.props.thread.group) {
      const keys = Object.keys(GROUPS);
      keys.forEach(key => {
        if (GROUPS[key] == this.props.thread.group) {
          name = key;
        }
      })
    }

    return (
      <TouchableOpacity onPress={() => this.props.onPress(this.props.thread)}>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <View style={styles.topLine}>
              <SPMediumText style={styles.name}>{name}</SPMediumText>
              <SPText style={styles.date}>{date}</SPText>
            </View>
            <SPText style={styles.text}>{text}</SPText>
          </View>
          <Image source={require('../../common/images/right-chevron.png')} />
        </View>
      </TouchableOpacity>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center'
  },
  thumbnail: {
    width: 38,
    height:38,
    borderRadius: 19,
    marginRight: 10
  },
  textContainer: {
    flexGrow: 1
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  name: {
    color: '#333'
  },
  date: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 5
  },
  text: {
    color: '#999999'
  }
})

export default connect(store => store)(Thread);
