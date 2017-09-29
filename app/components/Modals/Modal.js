import React from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  View,
  StyleSheet,
  StatusBar
} from 'react-native';

import { SPModal, SPModalHeader, SPModalBody, SPModalButton } from '../../common/SPModal';
import { Text } from '../../common/SPText';
import Button from '../../common/SPButton';

class Modal extends React.Component {

  render() {
    return (
      <View style={[styles.container]}>
        <StatusBar hidden={true} />
        <SPModal style={[styles.modal, this.props.style]}>
          <SPModalHeader
            styleName="modal"
            leftComponent={<SPModalButton icon="ios-close" onPress={this.props.onClose} />}
          >
            <View style={styles.header}>
              <Text styleName="h1 white">
                {this.props.title}
              </Text>
              <Text styleName="h3 translucent center">
                {this.props.description}
              </Text>
            </View>
          </SPModalHeader>
          <SPModalBody style={styles.body}>
            {this.props.body}
          </SPModalBody>
        </SPModal>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  modal: {
    flex: 0
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 15
  },
  body: {
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  inviteContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 6,
    padding: 20,
    marginTop: 20
  },
  inviteLink: {
    paddingBottom: 15
  },
  button: {
    marginTop: 20
  }
})

export default connect(store => store)(Modal);
