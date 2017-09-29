import React from 'react';
import {
  View,
  StyleSheet,
  Image
} from 'react-native';
import { Text, SPMediumText } from '../common/SPText';
import SPColors from '../common/SPColors';

export default class PickItem extends React.Component {
  render() {
    var style = {
      paddingHorizontal: this.props.missedCut ? 4 : 0,
      width: this.props.missedCut ? 40 : 30,
    };

    var textColor = this.props.textColor || '#999';

    if (typeof this.props.won === 'boolean') {
      textColor = this.props.won ? '#24B879' : '#E85D5D';
    }

    return (
      <View style={[styles.container, this.props.style]}>
        {this.props.topLabel &&
        <SPMediumText style={[styles.name, this.props.labelStyle, { color: textColor }]}>
          {this.props.topLabel}
        </SPMediumText>
        }

        {this.props.missing ?
          <Text style={[styles.missing, this.props.missingStyles]}>❓</Text>
          : this.props.x ?
          <Text style={[styles.missing, this.props.missingStyles, {fontSize:22}]}>❌</Text>
          :
          <Image
            key={this.props.id}
            source={{uri:this.props.logo}}
            style={[styles.logo, this.props.logoStyle]} />
        }
        {this.props.bubbleText &&

          <View style={[styles.scoreContainer, style]}>
            <Text styleName="medium" style={{ color: this.props.missedCut ? '#D0011B' : SPColors.primaryButtonColor }}>
              {this.props.bubbleText}
            </Text>
          </View>
        }
        <SPMediumText style={[styles.name, this.props.labelStyle, { color: textColor }]}>
          {this.props.alias}
        </SPMediumText>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  logo: {
    width: 40,
    height: 40
  },
  name: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  missing: {
    fontSize: 34,
    marginBottom: -5
  },
  scoreContainer: {
    borderRadius: 30,
    height: 30,
    backgroundColor: 'white',
    position: 'absolute',
    right: 5,
    bottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
