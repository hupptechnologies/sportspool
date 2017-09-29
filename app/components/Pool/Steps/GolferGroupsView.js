import React from 'react';
import {
  View,
  ScrollView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS
} from 'react-native';

import SPButton from '../../../common/SPButton';
import InputRadio from '../../../common/InputRadio';
import { Text, SPMediumText, SPText, SPBoldText } from '../../../common/SPText';
import SectionHeader from '../../../common/SectionHeader';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SPTextFieldInline from '../../../common/SPTextFieldInline';
import AndroidPicker from '../../AndroidPicker';

class GolferGroupsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showAndroidPicker: false,
      selectedGolfer: null
    };
  }

  render() {
    return (
      <ScrollView>
        <SPMediumText style={styles.inputTitle}>
          Golfers
        </SPMediumText>
        {this.props.golfers.map((player, idx) => {
          return (
            <TouchableOpacity
              key={player._id}
              onPress={() => {
                this.setState({
                  selectedGolfer: player
                });
                this.showGroupPicker(player);
              }}
            >
              <SPTextFieldInline
                label={`${player.name.first} ${player.name.last}`}
                value={player.group}
                editable={false}
              />
            </TouchableOpacity>
          )
        })}
        {Platform.OS === 'android' &&
          <AndroidPicker
            onRequestClose={() => this.setState({ showAndroidPicker: false })}
            visible={this.state.showAndroidPicker}
            title="Group Options"
            items={this.groupPickerItems()}
          />
        }
        <KeyboardSpacer />
      </ScrollView>
    );
  }

  groupPickerItems() {
    return this.props.groups.map(group => group.name).map((title, index) => {
      return {
        key: index,
        title: title,
        onPick: () => {
          this.setState({
            showAndroidPicker: false
          });

          this.setGolferGroup(title);
        }
      }
    });
  }

  showGroupPicker(golfer) {
    if (Platform.OS === 'android') {
      return this.setState({ showAndroidPicker: true });
    }

    const groups = this.props.groups.map(group => group.name);

    ActionSheetIOS.showActionSheetWithOptions({
      title: `Selected ${golfer.name.first} ${golfer.name.last}`,
      options: ['Cancel'].concat(groups),
      cancelButtonIndex: 0
    }, (index) => {
      if (index > 0) {
        this.setGolferGroup(groups[index-1]);
      }
    })
  }

  setGolferGroup(group) {
    this.props.onSelect(group, this.state.selectedGolfer);
  }

}

const styles = StyleSheet.create({
  inputTitle: {
    color: '#999',
    paddingHorizontal: 20,
    paddingTop: 10
  }
});

export default GolferGroupsView;