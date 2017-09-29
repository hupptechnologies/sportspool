import React from 'react';
import {
  DeviceEventEmitter,
  ListView,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'underscore';
import Border from '../../common/Border';
import { Text } from '../../common/SPText';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';
import Icon from 'react-native-vector-icons/Ionicons';

class Chat extends React.Component {

  constructor(props) {
    super(props);

    const pools = _.sortBy(_.uniq(this.props.entries.map(entry => entry.pool), pool => pool._id), 'created').reverse();

    this.state = {
      pools,
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }).cloneWithRows(pools)
    };
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
          title="Chat"
        >
        </SPModalHeader>
        <SPModalBody>
        {this.state.pools.length > 0 ?
          <ListView
            removeClippedSubviews={false}
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            renderSeparator={(s, r) => {
              return <Border key={`sep:${s}:${r}`} />
            }}
            renderRow={pool => {
              return (
                <TouchableOpacity onPress={() => this.openPoolChat(pool)} style={styles.container}>
                  <View style={styles.pool}>
                    <Text styleName="h3">{pool.name}</Text>
                    <Text styleName="muted">
                      {pool.league.name} {pool.style}
                    </Text>
                  </View>
                  <Icon name="ios-arrow-forward"color="#CCCCCC" size={20} style={styles.chevron}/>
                </TouchableOpacity>
              )
            }}
          />
        :
          <View style={{ flex: 1, marginHorizontal: 30, justifyContent: 'center' }}>
            <Text styleName="h1 muted medium center">
              List of pools you are in will appear here.
            </Text>
          </View>
        }
        </SPModalBody>
      </SPModal>
    )
  }

  dismiss() {
    this.props.navigator.pop()
  }

  openPoolChat(pool) {
    this.props.navigator.push({
      chat: {},
      pool: pool
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center'
  },
  chevron: {
    paddingLeft: 10
  }
});

export default connect((store) => {
  return store;
})(Chat);
