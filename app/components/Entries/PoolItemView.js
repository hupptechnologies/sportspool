import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Text, SPMediumText, SPText, SPBoldText } from '../../common/SPText';
import _ from 'lodash';
import moment from 'moment';

function StatsIndicator(props) {
  const pending = _.get(props, 'stats.poolStatusPending', 0);
  const survivors = _.get(props, 'stats.survivors', 0);
  const entryDeadline = moment(props.pool.entryDeadline);
  const isActive = props.pool.status !== 'closed';

  if (isActive) {
    var labelText = null;
    if (pending > 0) {
      labelText = `${pending} \nPENDING ENTRIES`;
    } else if (entryDeadline.isBefore() && survivors > 0) {
      labelText = `${survivors} \nSURVIVORS`;
    }

    if (labelText) {
      return <SPBoldText style={styles.statsDetail}>{labelText}</SPBoldText>
    }
  }

  return null;
}

export default class PoolItemView extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={styles.container}>
        <SPText style={styles.icon}>
          {
            this.props.pool.league.name == 'PGA' ? "⛳️" :
            this.props.pool.league.name == 'NFL' ? "🏈" : "🏀"
          }
        </SPText>
        <View>
          <SPMediumText style={styles.name}>
            {this.props.pool.name}
          </SPMediumText>
          <SPText style={styles.status}>
            {this.props.pool.league.name} {this.props.pool.style}
          </SPText>
        </View>

        <StatsIndicator { ...this.props } />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15
  },
  icon: {
    fontSize: 38,
    marginRight: 15,
    marginLeft: 10
  },
  name: {
    color: '#333',
    fontSize: 14,
    marginBottom: 1,
    backgroundColor: 'transparent'
  },
  status: {
    color: '#999',
    fontSize: 14,
    backgroundColor: 'transparent'
  },
  statsDetail: {
    color: '#F00',
    fontSize: 10,
    flex: 1,
    textAlign: 'right'
  }
})
