import React from 'react';
import { connect } from 'react-redux';
import {
  ActionSheetIOS,
  View,
  Modal,
  StyleSheet,
  Platform,
  Clipboard
} from 'react-native';

import { SPModal, SPModalHeader, SPModalBody, SPModalButton } from '../../common/SPModal';
import { Text } from '../../common/SPText';
import Button from '../../common/SPButton';

class CreatePoolModal extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <SPModal style={styles.modal}>
          <SPModalHeader
            styleName="modal"
            leftComponent={<SPModalButton icon="ios-close" onPress={this.props.onClose} />}
          >
            <View style={styles.header}>
              <Text styleName="h1 white">
                Your pool was created.
              </Text>
              <Text styleName="h3 white">
                Invite players.
              </Text>
            </View>
          </SPModalHeader>
          <SPModalBody style={styles.body}>
            <Text styleName="h1 dark center">
              {this.props.pool.name}
            </Text>
            <Text styleName="h3 dark center">
              {this.props.pool.league.name} {this.props.pool.style}
            </Text>
            <View style={styles.inviteContainer}>
              <Text styleName="medium dark center" style={styles.inviteLink}>
                {this.props.pool.inviteLink}
              </Text>
              <Text styleName="muted center">
                Anyone with this link can submit entries into your pool. You will activate or reject each submitted entry. Players cannot make picks nor appear in the pool until after their entry is activated.
              </Text>
              <Button style={styles.button} title={Platform.OS == 'android' ? "Copy Link" : "Share Link"} onPress={() => this.shareLink()} />
            </View>
          </SPModalBody>
        </SPModal>
      </View>
    )
  }

  shareLink() {
    if (Platform.OS == 'android') {
      return Clipboard.setString(this.props.pool.inviteLink);
    }

    ActionSheetIOS.showShareActionSheetWithOptions({
      url: this.props.pool.inviteLink
    }, (err) => alert(err.message
    ), (success, method) => {

    });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  modal: {
    flex: 0
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30
  },
  body: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center'
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

export default connect(store => store)(CreatePoolModal);
