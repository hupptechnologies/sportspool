import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Image,
  StyleSheet,
  Switch,
  ListView
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

import _ from 'underscore';
import Border from '../../common/Border';
import SPButton from '../../common/SPButton';
import SectionHeader from '../../common/SectionHeader';
import { getArchivedEntries } from '../../actions/entries';

class PastEntries extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }).cloneWithRowsAndSections({})
    };
  }

  componentDidMount() {
    getArchivedEntries(this.props.auth.token)
      .then(json => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRowsAndSections(this.mapEntries(json.data))
        })
      })
      .catch(err => alert(err.message))
  }

  mapEntries(entries) {
    var data = {};

    entries.forEach((entry) => {
      if (data[entry.pool.name]) {
        data[entry.pool.name].push(entry);
      } else {
        data[entry.pool.name] = [entry];
      }
    });

    return data;
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          title="My Past Entries"
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
        />
        <SPModalBody>
          <ListView
            dataSource={this.state.dataSource}
            removeClippedSubviews={false}
            renderSectionHeader={(d, s) => this.renderSectionHeader(d, s)}
            renderRow={(o,s,r) => this.renderRow(o,s,r)}
            renderSeparator={(s, r) => {
              return <Border key={`sep:${s}:${r}`} />
            }}
          />
        </SPModalBody>
      </SPModal>
    )
  }

  renderSectionHeader(entries, key) {
    const text = `${entries.length} ${entries.length > 1 ? 'Entries' : 'Entry'}`;
    return (
      <SectionHeader key={key} leftLabel={key} rightLabel={text} />
    );
  }

  renderRow(entry, sectionID, rowID) {
    return (
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <View>
          <SPMediumText>{entry.name}</SPMediumText>
          <SPText style={{color:'#999'}}>Round {entry.losingRound + 1}</SPText>
        </View>
        <SPText style={{
          color:'#999',
          marginTop: 5
        }}>{entry.status}</SPText>
      </View>
    )
  }

  dismiss() {
    this.props.navigator.pop()
  }

}

export default connect((store) => {
  return store;
})(PastEntries);
