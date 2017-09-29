import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Image
} from 'react-native';

import { Text } from '../common/SPText';
import Border from '../common/Border';

class AndroidPicker extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal
        animationType={"fade"}
        transparent={true}
        visible={this.props.visible}
        onRequestClose={this.props.onRequestClose}
      >
        <TouchableWithoutFeedback onPress={this.props.onRequestClose}>
          <View style={styles.overlay}>
              <View style={styles.container}>
               <View>
                 <Text styleName="bold h3" style={styles.title}>
                   {this.props.title}
                 </Text>

                 {this.props.items.map((item, index) => {
                   return (
                     <TouchableOpacity
                       key={`AndroidPickerItem${index}`}
                       onPress={() => item.onPick(item)} style={{ marginVertical: 5 }}
                       >
                       <View>
                         <Text styleName="link" style={{ paddingVertical: 5, fontSize: 16 }}>
                           {item.title}
                         </Text>
                       </View>
                     </TouchableOpacity>
                   )
                 })}
               </View>
              </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    backgroundColor: 'white',
    padding: 20,
    flex: 0
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    marginBottom: 6
  }
});

export default AndroidPicker;
