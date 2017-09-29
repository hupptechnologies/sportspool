import React, { Component } from 'react';
import {
  TouchableOpacity,
  Button,
  StyleSheet,
  Platform,
  View,
  SegmentedControlIOS
} from 'react-native';
import { Text } from '../common/SPText';
import SPButton from '../common/SPButton'
import { TabViewAnimated, TabBar } from 'react-native-tab-view';
import SPColors from '../common/SPColors';
import _ from 'lodash';

export default class TabView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: props.selectedIndex || 0,
      // Add `key` property for use in TabViewAnimated
      tabs: props.tabs.map((t,i) => {
        return { key: `${i}`, title: t }
      })
    };
  }

  render() {
    if (Platform.OS === 'ios') {
      return (
        <View style={{flex:1}}>
          <View backgroundColor={this.props.backgroundColor}>
            <SegmentedControlIOS
              key="segmented control"
              style={{margin: 10, zIndex: 2}}
              tintColor={this.tintColor()}
              values={this.state.tabs.map(r => r.title)}
              selectedIndex={this.state.selectedIndex}
              onChange={e => {
                this.onTabSelect(e.nativeEvent.selectedSegmentIndex)
              }}
            />
          </View>
          {this.props.routes[this.state.selectedIndex]}
        </View>
      )
    }

    return (
      <TabViewAnimated
        style={{flex:1}}
        backgroundColor={this.props.backgroundColor}
        navigationState={{
          index: this.state.selectedIndex,
          routes: this.state.tabs
        }}
        renderScene={(r) => this.renderScene(r)}
        renderHeader={(p) => this.renderHeader(p)}
        onRequestChangeTab={i => this.onTabSelect(i)}
      />
    );
  }

  onTabSelect(index) {
    this.setState({selectedIndex:index});
    if (this.props.onTabSelect) {
      this.props.onTabSelect(index);
    }
  }

  renderHeader(props) {
    return <TabBar {...props} indicatorStyle={{backgroundColor: "#5DB6E8"}} />;
  };

  renderScene({ route }) {
    var component = null;
    this.state.tabs.forEach((_tab, idx) => {
      if (route.title == _tab.title) {
        component = this.props.routes[idx];
      }
    })

    return component;
  };

  tintColor() {
    return this.props.tintColor || SPColors.primaryButtonColor;
  }
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    marginHorizontal: 10,
  },
  page: {
    flex: 1
  },
});
