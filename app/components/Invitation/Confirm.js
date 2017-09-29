import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image
} from 'react-native';
import { connect } from 'react-redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SPModal, SPModalHeader, SPModalBody, SPModalFooter, SPModalButton } from '../../common/SPModal'
import SPTextField from '../../common/SPTextField'
import { SPText } from '../../common/SPText'
import SPButton from '../../common/SPButton'
import _ from 'underscore'
import { joinPool } from '../../actions'
import uuid from 'uuid';

class ConfirmEntriesView extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      entries: _(props.numberOfEntries).times((n) => {
        return this.defaultEntryName(n + 1);
      })
    }
  }

  render() {
    const title = "Submit Entries (" + this.state.entries.length + ")"
    const fields = this.state.entries.map((name, i) => {
      const key = "textField" + i
      return (
        <SPTextField
          key={key}
          ref={key}
          label="Entry Name"
          placeholder="Enter an entry name"
          value={name}
          returnKeyType="next"
          onChange={(event) => this.entryNameEdited(event.nativeEvent.text, i)}
          onSubmitEditing={(event) => this.focusNextField(i + 1)}
          onDelete={() => this.removeEntry(i)}
        />
      )
    })

    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-arrow-round-back" onPress={() => this.dismiss()} />}
          title={title}
          rightComponent={
            this.canAddEntry() ?
            <SPModalButton title="Add" onPress={() => this.addEntry()} />
            : null
          }
        />
        <SPModalBody>
          <KeyboardAwareScrollView>
          <SPText style={styles.text}>These names are viewable by all players.</SPText>
          {fields}
        </KeyboardAwareScrollView>
        </SPModalBody>
        <SPModalFooter>
          <SPButton title="Submit Entries" onPress={() => this.submitEntries()} disabled={this.state.entries.length == 0} />
        </SPModalFooter>
      </SPModal>
    )
  }

  defaultEntryName(index) {
    var user = this.props.player || this.props.user;
    
    return `${user.name.first} ${user.name.last}'s Entry ${index}`;
  }

  canAddEntry() {
    const pool = this.props.invitation.pool;
    if (pool.maxEntriesPerUser < 0) {
      return true;
    }

    return this.state.entries.length < pool.maxEntriesPerUser;
  }

  addEntry() {
    this.setState({
      entries: this.state.entries.concat(this.defaultEntryName(this.state.entries.length + 1))
    })
  }

  removeEntry(index) {
    this.setState({
      entries: [
        ...this.state.entries.slice(0, index),
        ...this.state.entries.slice(index+1)
      ]
    });
  }

  focusNextField = (nextField) => {
    const field = this.refs['textField' + nextField]

    if (field === undefined) {
      // Previous text field
      this.refs['textField' + (nextField - 1)].refs['textInput'].blur()
    } else {
      field.refs['textInput'].focus()
    }
  }

  entryNameEdited(value, index) {
    this.setState({
      entries: this.state.entries.map((name, i) => {
        return i == index ? value : name
      })
    })
  }

  async submitEntries() {
    try {
      const entries = await joinPool({
        pool: this.props.invitation.pool._id,
        names: this.state.entries,
        player: this.props.player ? this.props.player._id : null
      }, this.props.auth.token);

      if (typeof this.props.player === 'undefined') {
        this.props.dispatch({
          type: 'ADD_ENTRIES',
          entries: entries
        });

        this.props.dispatch({
          type: 'UPDATE_INVITATION',
          invitation: {
            ...this.props.invitation,
            status: 'used'
          }
        });
      } else {
        this.props.dispatch({
          type: 'ADD_NOTIFICATION',
          data: {
            id: uuid.v1(),
            type: 'manager submitted entries',
            pool: this.props.invitation.pool,
            numEntries: entries.length,
            player: this.props.player
          }
        });
      }

      this.props.navigator.popToTop();
    } catch(error) {
      alert(error.message);
    }
  }

  dismiss() {
    this.props.navigator.pop()
  }
}

const styles = StyleSheet.create({
  text: {
    padding: 30,
    textAlign: 'center'
  }
});

const select = (store) => {
  return store;
};

export default connect(select)(ConfirmEntriesView)
