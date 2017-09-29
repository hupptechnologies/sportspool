import React from 'react';
import {
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Text, SPMediumText, SPText } from '../../common/SPText';
import SPColors from '../../common/SPColors';
import Icon from 'react-native-vector-icons/Ionicons';

export default class EntryItem extends React.Component {
  render() {

    var noop = () => {};
    var select = null;

    if (this.props.selectable) {
      var func = this.props.onSelect || noop;
      select = (
        <TouchableHighlight underlayColor={'white'} onPress={func} style={styles.selection}>
          {this.props.selected ?
            <Image style={styles.image} source={require('../../common/images/selected.png')} />
          :
            <Image style={styles.image} source={require('../../common/images/select.png')} />
          }
        </TouchableHighlight>
      );
    }

    var func = this.props.onPress || noop;
    const jsx = (
      <View style={styles.container}>
        <TouchableHighlight underlayColor={'white'} onPress={func} style={styles.content}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {this.props.leftLabel &&
                <View style={{marginRight: 10, backgroundColor: '#ccc', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 }}>
                  <Text styleName="medium muted white center" style={{ fontSize: 12 }}>
                    {this.props.leftLabel}
                  </Text>
                </View>
              }

              <View style={{ flexDirection: 'column' }}>
                <SPText style={styles.topLabel}>
                  {this.props.topLabel}
                </SPText>

              {this.props.bottomLabel &&
                <SPText style={styles.bottomLabel}>
                  {this.props.bottomLabel}
                </SPText>
              }
              </View>
            </View>
            {this.props.rightLabel &&
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text styleName="medium h3">
                  {this.props.rightLabel}
                </Text>
                <Icon name="ios-arrow-forward"color="#CCCCCC" size={18} style={styles.chevron}/>
              </View>
            }
          </View>
        </TouchableHighlight>
        {this.props.rightView}
        {select}
      </View>
    );

    return jsx;
  }
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  detail: {

  },
  selection: {
    height: 60,
    width: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 15
  },
  image: {

  },
  logo: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 19
  },
  topLabel: {
    color: '#4A4A4A',
    fontSize: 14
  },
  bottomLabel: {
    color: '#999',
    fontSize: 14
  },
  chevron: {
    paddingLeft: 20
  }
})
