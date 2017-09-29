import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform
} from 'react-native';

import SPGradientBackground from './SPGradientBackground';
import { Text, SPText } from './SPText';
import { Button } from '@shoutem/ui';
import SPColors from './SPColors';

import Icon from 'react-native-vector-icons/Ionicons';

class SPModalButton extends Component {
  render() {
    var array = [styles.modalButton, this.props.style];
    if (this.props.icon) {
      array.push({
        marginTop: -7
      });
    }

    return (
      <TouchableOpacity onPress={this.props.onPress} style={array}>
      {this.props.icon ?
        <Icon name={this.props.icon} color="#ffffff" size={36} />
        :
        <Text style={styles.modalButtonText}>
          {this.props.title}
        </Text>
      }
      </TouchableOpacity>
    );
  }
}

class SPModalFooter extends Component {
  render() {
    return (
      <View style={styles.footer}>
        {this.props.children}
      </View>
    )
  }
}

class SPModalHeader extends Component {
  render() {
    var title = null;
    if (this.props.titleComponent !== undefined) {
      title = this.props.titleComponent
    } else {
      title = <Text styleName="white center">{this.props.title}</Text>
    }

    const names = this.props.styleName ? this.props.styleName.split(' ') : '';

    const additionalStyles = {
      componentsBackground: {
        borderBottomWidth: !!~names.indexOf('modal') ? 0 : 1
      }
    };

    return (
      <View style={[{ backgroundColor: this.props.backgroundColor || SPColors.backgroundColor }, this.props.style]}>
        <View style={[styles.componentsBackground, additionalStyles.componentsBackground]}>
          <View style={styles.componentsContainer}>
            <View style={styles.leftComponent}>
              {this.props.leftComponent}
            </View>
            <View style={styles.centerComponent}>
              {title}
            </View>
            <View style={styles.rightComponent}>
              {this.props.rightComponent}
            </View>
          </View>
        </View>

        <View>
          {this.props.children}
        </View>

      </View>
    )
  }
}

class SPModalBody extends Component {
  render() {
    return (
      <View style={[styles.content, this.props.style]}>
        {this.props.children}
      </View>
    )
  }
}

class SPModal extends Component {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        {this.props.children}
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: Platform.OS === 'ios' ? 2 : 0,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-start'
  },
  componentsBackground: {
    borderBottomWidth: 1,
    borderBottomColor: SPColors.headerBorderColor,
    height: 60,
    paddingVertical: 10
  },
  componentsContainer: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    alignItems: 'center'
  },
  component: {
    height: 24,
    marginBottom: -8,
    alignSelf: 'flex-end',
    flex: 1
  },
  leftComponent: {
    alignItems: 'flex-start',
    flex: 0
  },
  centerComponent: {
    alignItems: 'center',
    flexShrink: 1
  },
  rightComponent: {
    alignItems: 'flex-end',
    flex: 0,
    minWidth: 70
  },
  title: {
    fontFamily: 'Avenir',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    flexGrow: 1
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: 'white'
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 70
  },
  modalButtonText: {
    color: '#ffffff'
  }
});

export { SPModal, SPModalHeader, SPModalBody, SPModalFooter, SPModalButton }
