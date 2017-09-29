import React from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  ListView,
  StyleSheet,
  View,
  Platform
} from 'react-native';

import EntryItem from './Pool/EntryItem';
import Border from '../common/Border';
import { Text } from '../common/SPText';
import SPButton from '../common/SPButton';
import SectionHeader from '../common/SectionHeader';
import AndroidPicker from './AndroidPicker';
import {
  availableEntryStatusChanges,
  changeEntriesStatus,
  ENTRY_STATUSES
} from '../actions/manager';
import {
  getEntry
} from '../actions/entries';
import _ from 'underscore';
import moment from 'moment';
import { generateInvitation } from '../actions/invitations';

class EntryListView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selectedEntries: [],
      showAndroidUserPicker: false,
      showAndroidMakeChangePicker: false,
      selectedUser: null,
      sectionStates: this.sectionToggleStates(props.data),
      data: props.data,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      sectionStates: this.sectionToggleStates(nextProps.data),
      data: nextProps.data
    });
  }

  sectionToggleStates(data) {
    var states = {};
    Object.keys(data).forEach(key => {
      states[key]= true
    });
    return states;
  }

  render() {
    return (
      <View style={{flex:1}}>
        <ListView
          removeClippedSubviews={false}
          enableEmptySections={true}
          dataSource={this.dataSource()}
          renderSectionHeader={(d, s) => this.renderSectionHeader(d, s)}
          renderSeparator={(s, r) => {
            return <Border key={`sep:${s}:${r}`} />
          }}
          renderRow={d => this.renderRow(d)}
        />
      {this.state.selectedEntries.length > 0 &&
        <View style={styles.changeStatusContainer}>
          <Text styleName="bold center" style={styles.changeStatusText}>
            Selected: {this.selectedDisplay()}
          </Text>
          <View style={styles.buttonsContainer}>
            <SPButton
              style={styles.cancelButton}
              type="small gray"
              title="Cancel"
              onPress={() => this.setState({selectedEntries:[]})}
            />
            <SPButton
              style={styles.changeStatusButton}
              type="small"
              title="Change Status"
              onPress={() => this.changeStatus()}
            />
          </View>
        </View>
      }

      {Platform.OS === 'android' &&
        <AndroidPicker
          onRequestClose={() => this.setState({ showModal: false })}
          visible={this.state.showModal}
          title="Change Status"
          items={this.pickerItems()}
        />
      }

      {Platform.OS === 'android' &&
        <AndroidPicker
          onRequestClose={() => this.setState({ showAndroidUserPicker: false })}
          visible={this.state.showAndroidUserPicker}
          title="Actions"
          items={this.userPickOptions().map(option => {
            return {
              ...option,
              onPick: () => {
                this.setState({
                  showAndroidUserPicker: false
                })
                option.func(this.state.selectedUser)
              }
            }
          })}
        />
      }

      {Platform.OS === 'android' && this.state.selectedUser &&
        <AndroidPicker
          onRequestClose={() => this.setState({ showAndroidMakeChangePicker: false })}
          visible={this.state.showAndroidMakeChangePicker}
          title="Actions"
          items={this.userMakeChangePickOptions(this.state.selectedUser).map(option => {
            return {
              ...option,
              onPick: () => {
                this.setState({
                  showAndroidMakeChangePicker: false
                })
                option.func(this.state.selectedUser)
              }
            }
          })}
        />
      }

      </View>
    );
  }

  pickerItems() {
    return Object.keys(ENTRY_STATUSES).map((key, index) => {
      return {
        key: index,
        title: ENTRY_STATUSES[key],
        onPick: () => {
          this.setState({
            selectedEntries: []
          });

          const entries = this.state.selectedEntries;
          this.props.dispatch(changeEntriesStatus(this.props.pool._id, entries, key, this.props.auth.token));

          if (this.props.onEntryStatusChange) {
            this.props.onEntryStatusChange(entries, key)
          }

          this.setState({
            showModal: false
          });
        }
      }
    });
  }

  dataSource() {
    var filteredData = {};

    Object.keys(this.state.sectionStates).forEach(key => {
      filteredData[key] = this.state.sectionStates[key] ? this.props.data[key] : []
    })

    return new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    }).cloneWithRowsAndSections(filteredData);
  }

  renderSectionHeader(entries, key) {
    const count = this.state.data[key] ? this.state.data[key].length : 0;
    return (
      <SectionHeader key={key} leftLabel={`${key} (${count})`} arrow={this.state.sectionStates[key] ? 'ios-arrow-down' : 'ios-arrow-forward'} onPress={() => {
        var status = {...this.state.sectionStates};
        status[key] = !status[key];

        this.setState({
          sectionStates: status
        })
      }} />
    );
  }

  renderRow(obj) {
    const selected = this.isEntrySelected(obj.entries || [obj]);

    if (this.props.renderAsUser || obj.renderAsUser) {
      
      var bottomLabel = obj.entries.length + (obj.entries.length === 1 ? ' Entry' : ' Entries');

      if (this.props.pool.league.name == "PGA") {
        bottomLabel += `, ${obj.missedCut} golfers cut`
      }

      return (
        <EntryItem
          key={obj._id}
          thumbnail={obj.thumbnail}
          selectable={true}
          selected={selected}
          topLabel={`${obj.name.first} ${obj.name.last}`}
          bottomLabel={bottomLabel}
          onSelect={() => this.onEntriesPress(obj.entries, !selected)}
          onPress={() => this.onUserPress(obj)}
        />
      )
    }

    return (
      <EntryItem
        key={obj._id}
        thumbnail={obj.user.thumbnail}
        topLabel={obj.name}
        bottomLabel={`${obj.user.name.first} ${obj.user.name.last}`}
        selectable={true}
        selected={selected}
        onSelect={() => this.onEntriesPress([obj], !selected)}
        onPress={() => this.onUserPress(obj.user)}
        rightView={<Text styleName="small muted">{moment(obj.updated || obj.created).format('M/D h:mma')}</Text>}
      />
    );
  }

  isEntrySelected(entries) {
    var ids = entries.map(entry => entry._id);
    var filtered = this.state.selectedEntries.filter(e => !!~ids.indexOf(e._id));
    return filtered.length == entries.length;
  }

  onEntriesPress(entries, selected) {
    if (selected) {
      this.setState({
        selectedEntries: [...this.state.selectedEntries, ...entries]
      });
    } else {
      var ids = entries.map(entry => entry._id);
      this.setState({
        selectedEntries: this.state.selectedEntries.filter(e => !~ids.indexOf(e._id))
      })
    }
  }

  userPickOptions() {
    var options = [{
      key: 0,
      title: 'Cancel',
      func: () => {}
    }];

    if (moment().isBefore(moment.utc(this.props.pool.entryDeadline))) {
      options.push({
        key: 4,
        title: 'Add Entries for Player',
        func: (user) => {
          this.showAddEntries(user);
        }
      });
    }

    return options.concat([{
      key: 3,
      title: `Make or Change Player's Pick`,
      func: (user) => {
        this.openMakeChangePicks(user)
      }
    }, {
      key: 2,
      title: `Edit Player's Entry Name`,
      func: (user) => {
        this.editEntryNames(user);
      }
    }, {
      key: 1,
      title: 'View Profile',
      func: (user) => {
        this.props.navigator.push({
          user: user,
          pool: this.props.pool
        });
      }
    }]);
  }

  respondToUserPickOptions(index, user) {
    this.setState({
      showAndroidUserPicker: false
    });

    var option = this.userPickOptions()[index];
    if (option) {
      option.func(user);
    }
  }

  onUserPress(user) {
    if (Platform.OS === 'android') {
      this.setState({
        showAndroidUserPicker: true,
        selectedUser: user
      });
    } else {
      ActionSheetIOS.showActionSheetWithOptions({
        options: this.userPickOptions().map(o => o.title),
        cancelButtonIndex: 0
      }, (buttonIndex) => {
        this.respondToUserPickOptions(buttonIndex, user);
      });
    }
  }

  showAddEntries(user) {
    const past = moment().isAfter(moment.utc(this.props.pool.entryDeadline));
    if (past) {
      alert('Past the entry deadline.');
    } else {
      var pool = this.props.pool;
      var token = this.props.auth.token;
      generateInvitation(pool, token).then(res => {
        this.props.navigator.push({
          invitation: res.invitation,
          navigator: this.props.navigator,
          player: user
        });
      }).catch((err) => {
        alert(err.message);
      });
    }
  }

  editEntryNames(user) {
    const entries = this.props.entriesForUser(user);
    this.props.navigator.push({
      player: {
        ...user,
        entries
      },
      pool: this.props.pool,
      navigator: this.props.navigator,
      type: 'edit entry names'
    });
  }

  openMakeChangePicks(user) {
    if (Platform.OS === 'android') {
      this.setState({
        showAndroidMakeChangePicker: true,
        selectedUser: user
      });
    } else {
      ActionSheetIOS.showActionSheetWithOptions({
        options: this.userMakeChangePickOptions(user).map(o => o.title),
        cancelButtonIndex: 0
      }, (buttonIndex) => {
        this.respondToUserMakeChangePickOptions(buttonIndex, user);
      });
    }
  }

  userMakeChangePickOptions(user) {
    var that = this;
    var options = [{
      key: 0,
      title: 'Cancel',
      func: () => {
      }
    }];

    const entries = this.props.entriesForUser(user);

    return options.concat(entries.map((entry, idx) => {
      return {
        key: idx + 1,
        title: entry.name,
        func: () => {
          this.respondToUserMakeChangePickOptions(idx + 1, user);
        }
      }
    }))
  }

  async respondToUserMakeChangePickOptions(buttonIndex, user) {
    var index = buttonIndex - 1;
    if (index >= 0) {
      const _entry = this.props.entriesForUser(user)[index];
      const token = this.props.auth.token;

      this.props.dispatch({
        type: 'SHOW_ACTIVITY_INDICATOR',
        text: 'Fetching entry...'
      });
  
      try {
        const entry = await getEntry(_entry, token);
        this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR '});
        this.props.navigator.push({
          entry,
          managerEditing: true
        })
      } catch(err) {
        this.props.dispatch({ type: 'HIDE_ACTIVITY_INDICATOR '});
        alert(err.message);
      }

    }
  }

  changeStatus() {
    if (Platform.OS === 'android') {
      return this.setState({
        showModal: true
      });
    }

    const statuses = availableEntryStatusChanges(this.state.selectedEntries);
    const actionSheetOptions = {
      options: [...['Cancel'], ...statuses],
      cancelButtonIndex: 0
    };

    const destructiveIndex = statuses.indexOf('Reject');
    if (destructiveIndex >= 0) {
      actionSheetOptions.destructiveButtonIndex = destructiveIndex + 1;
    }

    ActionSheetIOS.showActionSheetWithOptions(actionSheetOptions, (index) => {
      if (index > 0) {
        const entries = this.state.selectedEntries;
        const status = this.poolStatus(statuses[index - 1]);

        // Must be called before this.props.dispatch
        this.setState({
          selectedEntries: []
        });

        this.props.dispatch(changeEntriesStatus(this.props.pool._id, entries, status, this.props.auth.token));

        if (this.props.onEntryStatusChange) {
          this.props.onEntryStatusChange(entries, status)
        }
      }
    });
  }

  poolStatus(display) {
    switch (display) {
      case 'Activate (Tentative)':
        return 'activated';
      case 'Activate (Final)':
        return 'activated_paid';
      case 'Reject':
        return 'rejected';
      case 'Activate (Final)':
        return 'activated_paid';
      case 'Activated (Tentative)':
        return 'activated';
      default:
        return '';
    }
  }

  selectedDisplay() {
    const grouped = _.groupBy(this.state.selectedEntries, entry => entry.user._id);

    var numUsers = Object.keys(grouped).length;
    var numEntries = this.state.selectedEntries.length;
    var text = `${numUsers} `;

    text += numUsers == 1 ? "Player" : "Players";
    text += `, ${numEntries} `;
    text += numEntries == 1 ? "Entry" : "Entries";

    return text;
  }
}

const styles = StyleSheet.create({
  changeStatusContainer: {
    height: 120,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingVertical: 20
  },
  buttonsContainer: {
    flexDirection: 'row'
  },
  changeStatusText: {
    marginBottom: 15
  },
  cancelButton: {
    flex: 1,
    marginLeft: 20,
    marginRight: 10
  },
  changeStatusButton: {
    flex: 1,
    marginLeft: 10,
    marginRight: 20
  }
});

export default connect((store) => {
  return store;
})(EntryListView);
