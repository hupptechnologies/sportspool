import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import { connect } from 'react-redux';
import Appearance from '../common/Appearance';
import SPColors from '../common/SPColors';
import SPButton from '../common/SPButton';
import { Text, SPText } from '../common/SPText';
import Signup from './Registration/Signup';
import Login from './Registration/Login';

class LandingScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isSigningUp: false,
      isLoggingIn: false
    };
  }

  onPressSignUp() {
    this.setState({
      isSigningUp: true
    })
  }

  render() {
    return (
      <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: undefined,
      height: undefined,
      paddingHorizontal: 30,
      backgroundColor: '#2E5A98',
    }}>

        <View style={[styles.section, {marginTop: 60}]}>
          <Image source={require('../common/images/logo.png')} style={{width:144,height:87}} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.tagline]} styleName="center white">
            Create, manage, and play sports pools on one mobile app.
          </Text>
        </View>

        <View style={[styles.section, {marginBottom: 53}]}>
          <SPButton
            onPress={() => this.onPressSignUp()}
            title="Sign Up"
            style={{marginBottom: 20, width: 220}}
          />
          <View style={{flexDirection: 'row'}}>
            <SPText style={[styles.text]}>Already have an account? </SPText>
            <TouchableOpacity onPress={() => this.setState({isLoggingIn:true})}>
              <SPText style={[styles.text, styles.textButton]}>Log in</SPText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, styles.last]}>
          <SPText style={[styles.lightText]}>By signing up you agree to our</SPText>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity>
              <SPText style={[styles.text, styles.textButton]}>
                Terms & Conditions
              </SPText>
            </TouchableOpacity>
            <SPText style={[styles.lightText]}> and </SPText>
            <TouchableOpacity>
              <SPText style={[styles.text, styles.textButton]}>
                Privacy Policy
              </SPText>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.isSigningUp}
          onRequestClose={() => this.setState({isSigningUp:false}) }
        >
          <Signup onClose={() => this.setState({isSigningUp:false})} />
        </Modal>

        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.isLoggingIn}
          onRequestClose={() => this.setState({isLoggingIn:false}) }
        >
          <Login onClose={() => this.setState({isLoggingIn:false})} />
        </Modal>

      </View>
    );
  }

}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  last: {
    marginBottom: 20,
    flex: 0
  },
  tagline: {
    fontSize: 18,
    marginBottom: 20
  },
  text: {
    color: 'white',
  },
  lightText: {
    color: '#B8D0EA',
  },
  textButton: {
    fontWeight: 'bold'
  }
});

const select = (store) => {
  return {
  };
};

export default connect(select)(LandingScreen);
