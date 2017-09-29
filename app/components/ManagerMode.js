import React from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  View,
  ListView,
  RefreshControl,
  Image
} from 'react-native';
import Border from '../common/Border';
import SectionHeader from '../common/SectionHeader';
import PoolItemView from './Entries/PoolItemView';
import SPButton from '../common/SPButton';
import { Text } from '../common/SPText';
import SPColors from '../common/SPColors';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';
import _ from 'lodash';
import moment from 'moment';

class ManagerMode extends React.Component {

  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) =>  s1 !== s2
    });

    const actionNeeded = _.some(this.props.poolStats, stats => stats.poolStatusPending > 0);
    this.state = {
      refreshing: false,
      activePoolDataSource: dataSource,
      pastPoolDataSource: dataSource,
      index: 0,
      routes: [
        { key: '1', title: `Active Pools${actionNeeded && ' 🔴' || ''}` },
        { key: '2', title: 'Past Pools' }
      ]
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState((prevState, props) => {
      const sortedPools = _.sortBy(props.pools, 'created').reverse();
      const [activePools, pastPools] = _.partition(sortedPools, {status: 'open'});

      return {
        activePoolDataSource: prevState.activePoolDataSource.cloneWithRows(activePools),
        pastPoolDataSource: prevState.pastPoolDataSource.cloneWithRows(pastPools),
        refreshing: false
      }
    });
  }

  _handleChangeTab = (index) => this.setState({ index });
  _renderHeader = (props) => {
    return <TabBar
        {...props}
        renderLabel={(scene) => <Text styleName='h3 white'>{scene.route.title}</Text>}
        style={{backgroundColor: SPColors.managerColor}}
      />;
  }
  _renderScene = ({ route }) => {
    return (
      <ListView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.onRefresh()}
          />
        }
        renderSeparator={(s,r) => <Border key={r} />}
        dataSource={route.key === '1' ? this.state.activePoolDataSource : this.state.pastPoolDataSource}
        renderSectionHeader={(p) => <SectionHeader leftLabel={moment(p.start).format('YYYY')} />}
        renderRow={(p) => {
          return (
            <PoolItemView
              key={p.id}
              pool={p}
              stats={this.props.poolStats[p.id]}
              onPress={() => this.props.onManagerPoolPress(p) }
            />
          )
        }}
      />
    );
  }

  render() {
    if (this.props.pools.length == 0) {
      return (
        <View style={{ flex: 1, marginTop: 60, alignItems: 'center' }}>
          <Image source={require('../common/images/logo_colored.png')} />
          <Text styleName="center bold h1" style={{ marginTop: 40 }}>Create a new sports pool.</Text>
          <Text styleName="center h3 muted" style={{ marginTop: 15 }}>Give it a try.</Text>
          <SPButton style={{position:'absolute',bottom:20,left:30,right:30}} title="Create Pool" onPress={() => this.props.onCreatePoolPress()} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TabViewAnimated
          style={styles.container}
          navigationState={this.state}
          renderScene={this._renderScene}
          renderHeader={this._renderHeader}
          onRequestChangeTab={this._handleChangeTab}
        />
        <View style={styles.createContainer}>
           <SPButton style={styles.createButton} title="Create New Pool" onPress={() => this.props.onCreatePoolPress()} />
        </View>
      </View>
    );
  }

  onRefresh() {
    this.setState({refreshing: true});
    this.props.onRefresh();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  createContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 6,
    padding: 20
  },
  createButton: {
    height: 48,
    alignSelf: 'stretch'
  }
})

export default connect(store => store)(ManagerMode);
