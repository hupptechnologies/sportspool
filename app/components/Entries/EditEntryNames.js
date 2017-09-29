import React from 'react';
import {
View,
StyleSheet,
ScrollView
} from 'react-native'
import { connect } from 'react-redux';
import {
SPModal,
SPModalHeader,
SPModalBody,
SPModalFooter,
SPModalButton
} from '../../common/SPModal';
import { Text } from '../../common/SPText';
import SPColors from '../../common/SPColors';
import SPTextField from '../../common/SPTextField';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { editEntryNames } from '../../actions/entries';
import {
  getAllEntries
} from '../../actions/manager';
import uuid from 'uuid';

class EditEntryNames extends React.Component {
  constructor(props) {
    super(props);

    var names = {};

    props.player.entries.forEach(entry => {
      names[entry._id] = entry.name
    })

    this.state = {
      names: names
    }
  }

  render() {
    return (
      <SPModal>
      <SPModalHeader
      backgroundColor={SPColors.managerColor}
      leftComponent={<SPModalButton title="Cancel" onPress={() => this.props.navigator.pop()}/>}
      titleComponent={
      <Text styleName="translucent">
      Edit Entry Names
      </Text>
      }
      rightComponent={<SPModalButton title="Save" onPress={() => this.saveNames()}/>}
      />
      <SPModalBody>
      <Text style={{padding:20}} styleName="muted center">{"Entry names are viewable by all players.\nTap an entry name to edit."}</Text>
      <ScrollView>
      {this.props.player.entries.map((entry, idx) => {
        return (
          <SPTextField
            key={`${entry._id}`}
            label="Entry Name"
            placeholder="Enter an entry name"
            value={this.state.names[entry._id]}
            onChangeText={(text) => this.entryNameEdited(text, idx)}
          />
        )
      })}
      <KeyboardSpacer />
      </ScrollView>
      </SPModalBody>
      </SPModal>
    )
  }

  entryNameEdited(name, index) {
    var names = this.state.names;
    
    this.props.player.entries.forEach((entry, idx) => {
      names[entry._id] = index == idx ? name : names[entry._id]
    })

    this.setState({
      names: names
    });
  }

  saveNames() {
    var names = this.state.names;
    var updatedEntries = []

    this.props.player.entries.forEach((entry, idx) => {
      updatedEntries.push({
        name: names[entry._id],
        _id: entry._id
      })
    })

    editEntryNames(updatedEntries, this.props.auth.token).then((res) => {
      this.props.navigator.pop();

      const poolID = this.props.pool.id;
      const token = this.props.auth.token;

      this.props.dispatch(getAllEntries(poolID, token));

      this.props.dispatch({
        type: 'UPDATE_ENTRY_NAMES',
        poolID: this.props.pool._id,
        entries: res.entries
      });

      this.props.dispatch({
        type: 'ADD_NOTIFICATION',
        data: {
          id: uuid.v1(),
          type: 'edited entry names',
          numEntries: res.entries.length,
          player: this.props.player
        }
      });
    }).catch(err => alert(err.message))
  }
}

const styles = StyleSheet.create({

});

const select = (store) => {
  return store;
}

export default connect(select)(EditEntryNames);