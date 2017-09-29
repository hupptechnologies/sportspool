import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  DeviceEventEmitter,
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
import {
  loadUserNotificationSettings,
  changeNotificationSetting
} from '../../actions/notificationSettings';

class CustomizeNotifications extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }).cloneWithRowsAndSections(this.props.notificationSettings || {})
    };
  }

  componentDidMount() {
    this.props.dispatch(loadUserNotificationSettings());
  }

  componentWillMount() {
    const sub = DeviceEventEmitter.addListener('CustomizeNotifications', c => this.didReceiveNewNotificationSettings(c));

    this.setState({
      propsSubscriber: sub
    });
  }

  componentWillUnmount() {
    this.state.propsSubscriber.remove();
  }

  didReceiveNewNotificationSettings(settings) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(settings)
    });
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          title="Customize Notifications"
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
        />
        <SPModalBody>

        {this.arePushNotificationsDisabled() &&
          <View style={{
            backgroundColor: '#F6F6F6',
            margin: 20,
            padding: 20,
            borderRadius: 6
          }}>
            <SPMediumText style={{
              color:'#999',
              textAlign: 'center',
            }}>
              Push notifications are disabled. Open System Settings on your phone to enable.
            </SPMediumText>
            <SPButton
              style={{ marginTop: 20 }}
              type="gray"
              title="Open Settings"
              onPress={this.openSettings()}
            />
          </View>
        }

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

  renderSectionHeader(settings, key) {
    return (
      <SectionHeader key={key} leftLabel={key} />
    );
  }

  renderRow(setting, sectionID, rowID) {
    return (
      <View key={`row:${sectionID}:${rowID}`} style={{
        paddingHorizontal: 20,
        paddingVertical: 15
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <SPMediumText>{setting.name}</SPMediumText>
          <Switch
            value={setting.value}
            disabled={!setting.enabled}
            onValueChange={(value) => this.props.dispatch(changeNotificationSetting(setting, value))}
          />
        </View>
        {setting.description &&
          <SPText style={{color:'#999',marginTop:2}}>{setting.description}</SPText>
        }
      </View>
    )
  }

  /**
   * @desc Determines if user disabled ability to accept push notifications.
   */
  arePushNotificationsDisabled() {
    // TODO: Determine PN settings
    return true;
  }

  /**
   * @desc Open phone's system settings to allow user to enable push notifications.
   */
  openSettings() {

  }

  dismiss() {
    this.props.navigator.pop()
  }

}

export default connect((store) => {
  return store;
})(CustomizeNotifications);
