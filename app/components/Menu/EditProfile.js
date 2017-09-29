import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableOpacity,
  DeviceEventEmitter
} from 'react-native';

import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';

import {
  Text,
  SPText,
  SPMediumText
} from '../../common/SPText';
import SPButton from '../../common/SPButton';
import SPTextField from '../../common/SPTextField';
import KeyboardHandler from '../KeyboardHandler';
import _ from 'underscore';

import { updateUser, logout } from '../../actions/user';

import ActivityIndicator from '../ActivityIndicator';

class EditProfile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      originalProfile: {...props.user},
      profile: {...props.user}
    };
  }

  componentWillMount() {
    const sub = DeviceEventEmitter.addListener('EditProfile', p => this.didReceiveNewProps(p));

    this.setState({
      propsSubscriber: sub
    });
  }

  componentWillUnmount() {
    this.state.propsSubscriber.remove();
  }

  didReceiveNewProps(user) {
     this.setState({
       originalProfile: {...user},
       profile: {...user}
     });
  }

  fields() {
    return [{
      label: 'First Name',
      placeholder: 'Must provide your first name',
      key: 'name.firstName',
      editable: true,
      keyboardType: 'default',
      value: () => {
        return this.state.profile.name.first;
      },
      update: (text) => {
        const name = {...this.state.profile.name, first: text};
        this.setState({
          profile: {
            ...this.state.profile,
            name: name
          }
        })
      }
    }, {
      label: 'Last Name',
      placeholder: 'Must provide your last name',
      key: 'name.lastName',
      editable: true,
      keyboardType: 'default',
      value: () => {
        return this.state.profile.name.last;
      },
      update: (text) => {
        const name = {...this.state.profile.name, last: text};
        this.setState({
          profile: {
            ...this.state.profile,
            name: name
          }
        })
      }
    }, {
      label: 'Email',
      placeholder: 'Add your email address',
      key: 'email',
      editable: false,
      keyboardType: 'email-address',
      value: () => {
        return this.state.profile.email;
      },
      update: (text) => {
        this.setState({
          profile: {
            ...this.state.profile,
            email: text
          }
        })
      }
    }, {
      label: 'Phone',
      placeholder: 'Add your mobile number',
      key: 'phone',
      editable: true,
      keyboardType: 'phone-pad',
      value: () => {
        return this.state.profile.phone;
      },
      update: (text) => {
        this.setState({
          profile: {
            ...this.state.profile,
            phone: text
          }
        })
      }
    }];
  }

  hasUnsavedChanges() {
    const o = this.state.originalProfile, n = this.state.profile;
    return o.name.first != n.name.first || o.name.last != n.name.last || o.email != n.email || o.phone != n.phone;
  }

  render() {
    const rightText = this.hasUnsavedChanges() ? 'Save' : 'Log out';
    const rightHandler = this.hasUnsavedChanges() ? () => this.saveProfile() : () => this.logout();

    return (
      <SPModal>
        <SPModalHeader
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
          title="Edit Profile"
          rightComponent={<SPModalButton title={rightText} onPress={rightHandler} />}
        />
        <SPModalBody>
          <KeyboardHandler ref='kh' offset={65}>
            <View>
              {this.fields().map((obj,i) => {
                return <SPTextField
                  key={obj.key}
                  ref={obj.key}
                  editable={obj.editable}
                  keyboardType={obj.keyboardType}
                  label={obj.label}
                  value={obj.value()}
                  placeholder={obj.placeholder}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onChangeText={t => obj.update(t)}
                  onFocus={()=>this.refs.kh.inputFocused(this,obj.key)}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              })}
            </View>
          </KeyboardHandler>
        </SPModalBody>
        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.text}
        />
      </SPModal>
    );
  }

  focusNextField(idx) {
    const fields = this.fields();
    if (idx < fields.length) {
      this.refs[fields[idx].key].refs['textInput'].focus();
    }
  }

  saveProfile() {
    const user = this.props.user;
    const params = this.state.profile;
    const token = this.props.auth.token;

    this.props.dispatch(updateUser(user, params, token));
    this.props.dispatch({
      type: 'SHOW_ACTIVITY_INDICATOR',
      text: 'Updating profile...'
    });

    Keyboard.dismiss();
  }

  logout() {
    this.props.dispatch(logout());
    Keyboard.dismiss();
  }

  dismiss() {
    this.props.navigator.pop()
  }

}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 5
  }
})

export default connect((store) => {
  return store;
})(EditProfile);
