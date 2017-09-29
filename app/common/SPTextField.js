import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity
} from 'react-native';

import { SPText } from './SPText';
import SPColors from './SPColors';
import Border from './Border';
import Icon from 'react-native-vector-icons/Ionicons';

const HEIGHT = 40;

class SPTextField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: HEIGHT
    }
  }

  render() {
    let styles = allStyles;

    if (this.props.type == 'light') {
      styles = {...styles, ...lightStyles}
    }

    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <SPText style={[styles.label]}>{this.props.label}</SPText>
        <View style={{flexDirection: 'row'}}>
          <TextInput
            ref="textInput"
            placeholder={this.props.placeholder}
            placeholderTextColor={this.props.type == 'light' ? '#6A9CC5' : '#c1c1c1'}
            onContentSizeChange={(e) => this.onHeightChange(e.nativeEvent.contentSize.height)}
            underlineColorAndroid="rgba(0,0,0,0)"
            {...this.props}
            style={[styles.input, {height: this.state.height}, this.props.style]}
          />

          {this.props.onDelete &&
            <TouchableOpacity onPress={this.props.onDelete} style={styles.deleteButton}>
              <Icon name="ios-close" size={20} color={"white"} style={styles.deleteButtonIcon} />
            </TouchableOpacity>
          }
        </View>
        <Border style={this.props.bottomBorderStyle} />
      </View>
    )
  }

  onHeightChange(contentHeight) {
    const height = Math.max(HEIGHT, contentHeight);

    this.setState({ height: height });

    if (this.props.onHeightChange) {
      this.props.onHeightChange(height);
    }
  }
}

const allStyles = StyleSheet.create({
  container: {
    // borderBottomWidth: 1,
    // borderBottomColor: '#F5F5F5',
    paddingTop: 13,
    backgroundColor: 'white'
  },
  label: {
    textAlign: 'left',
    color: '#999999',
    paddingHorizontal: 20,
    marginBottom: -3
  },
  input: {
    fontFamily: 'Avenir',
    color: '#333333',
    paddingHorizontal: 20,
    marginBottom: 3,
    flexGrow: 1
  },
  deleteButton: {
    backgroundColor: SPColors.primaryButtonColor,
    marginRight: 20,
    width: 24,
    height: 24,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  deleteButtonIcon: {
    marginTop: 2,
    backgroundColor: 'transparent'
  }
});

const lightStyles = {
  container: {
    borderBottomColor: 'rgba(180, 216, 230, .12)'
  },
  label: {
    color: '#B8D0EA'
  },
  input: {
    color: 'white'
  }
};

export default SPTextField;
