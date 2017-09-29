import React from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  ActionSheetIOS,
  View,
  StyleSheet,
  Modal,
  Keyboard,
  Dimensions
} from 'react-native';

import { Text } from '../../common/SPText';
import SPTextField from '../../common/SPTextField';
import Button from '../../common/SPButton';
import KeyboardHandler from '../KeyboardHandler';
import { getInvitations, registerPoolLink } from '../../actions/invitations';
import ActivityIndicator from '../ActivityIndicator';

class FindInvitationView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      linkSubmitted: false,
      invitation: null,
      link: null,
      keyboardSpace: 0
    };
  }

  componentWillUnmount() {
    if (this._didShowListener) {
      this._didShowListener.remove();
      this._didShowListener = null;
    }
  }

  onKeyboardWillHide(frames) {
    if (this._didShowListener) {
      this._didShowListener.remove();
      this._didShowListener = null;
    }

    this.setState({
      keyboardSpace: 0
    });
  }

  adjustParentScrollViewBy(y) {
    const val = this.props.parentScrollView.scrollProperties.offset + y;
    this.props.parentScrollView.scrollTo({x: 0, y: val, animated: true})
  }

  contentOutsideVisibleBounds() {
    const props = this.props.parentScrollView.scrollProperties;
    return props.contentLength > props.visibleLength;
  }

  render() {
    const submitted = this.state.linkSubmitted;
    const invitation = this.state.invitation;
    const title = submitted ? "Success!" : "Find your invitation";
    const description = submitted && invitation ? `You now have your invitation for ${invitation.pool.name}.` : 'Copy and paste the pool invitation link sent to you by the pool manager.';

    return (
      <View style={{
        margin: 20,
        padding: 20,
        backgroundColor: '#F6F6F6',
        borderRadius: 6,
        shadowColor: 'black',
        shadowOffset: {
          width: 0,
          height: 0
        },
        shadowOpacity: 0.23,
        shadowRadius: 6
      }}>
        <Text styleName="h2 center bold" style={{ marginBottom: 10 }}>
          Find your invitation
        </Text>
        <Text styleName="h3 center muted" style={{ marginBottom: 5 }}>
          Copy and paste the pool invitation link sent to you by the pool manager.
        </Text>
        <View ref="modal" style={styles.textFieldContainer}>
          <SPTextField
            autoCapitalize="none"
            autoCorrect={false}
            // autoFocus={true}
            containerStyle={{marginBottom: 20,backgroundColor: '#F6F6F6'}}
            style={{backgroundColor: '#F6F6F6'}}
            label="Pool Link"
            placeholder="Enter pool invitation link"
            value={this.state.link}
            onChangeText={t => this.setState({ link: t })}
            onSubmitEditing={() => {
              this.submitLink();
            }}
            returnKeyType="done"
          />
          <Button
            style={styles.button}
            title="Submit"
            onPress={() => this.submitLink()} />
        </View>
        <View style={{ height: this.state.keyboardSpace }}></View>
      </View>
    );
  }

  submitLink() {
    Keyboard.dismiss();

    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Submitting link...'
    })

    const link = this.state.link;
    const token = this.props.auth.token;

    if (!link || link === "") {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
      alert("You must enter an invitation link. Please try again.")
      return;
    }

    registerPoolLink(link, token).then(invitation => {
      if (invitation) {
        this.props.dispatch({
          type: 'ADD_INVITATION',
          invitation
        });
        this.props.dispatch({
          type: 'HIDE_ACTIVITY_INDICATOR'
        });
        this.setState({
          linkSubmitted: true,
          invitation
        });

        this.props.dispatch(getInvitations(token));

        Alert.alert('Success!', `You now have your invitation for ${invitation.pool.name}.`);
      } else {
        alert(`Unable to find invitation.`);
      }
    }).catch(err => {
      this.props.dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
      alert(err.message)
    });
  }

}

const styles = StyleSheet.create({
  textFieldContainer: {
    borderBottomColor: '#F5F5F5',
    borderBottomWidth: 1
  },
  // button: {
  //   marginHorizontal: 20,
  //   marginTop: 40,
  //   marginBottom: -10
  // }
});

export default connect(store => store)(FindInvitationView);
