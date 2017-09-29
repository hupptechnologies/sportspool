import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import { SPMediumText, SPText } from './SPText';
import Border from './Border';

export default class InputRadio extends Component {

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => this.props.onPress(!this.props.selected)}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <SPText style={styles.title}>{this.props.title}</SPText>
            {this.props.selected ?
            <Image source={require('./images/selected.png')} />
            : !this.props.hideSelection ?
            <Image source={require('./images/select.png')} />
            : null
            }
          </View>
          {typeof this.props.description === 'string' && this.props.description.length > 0 ?
            <SPText style={styles.description}>
              {this.props.description}
            </SPText>
          : null}
          <Border style={styles.border} />
        </View>
      </TouchableWithoutFeedback>
    );
  }

}

const styles = StyleSheet.create({
  container: {

  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  title: {
    color: '#333'
  },
  description: {
    color: '#999',
    paddingHorizontal: 20,
    paddingBottom: 20
  },
});
