import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  TextInput,
  Platform
} from 'react-native';
import EntryListView from '../EntryListView';
import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';
import SPColors from '../../common/SPColors';
import { Text } from '../../common/SPText';
import SPTextField from '../../common/SPTextField';
import ActivityIndicator from '../ActivityIndicator';

class Search extends Component {

    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <SPModal>
        <SPModalHeader
          backgroundColor={SPColors.managerColor}
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.props.dismiss()}/>}
          titleComponent={
            <Text styleName="translucent">
                Search Player and Entry Names
            </Text>
          }
        />
        <SPModalBody>
            <View style={{ padding: 10 }}>
                <View style={{ backgroundColor: '#E6E6E6', borderRadius: 3, paddingLeft: 15 }}>
                <TextInput
                    style={styles.input}
                    autoFocus={true}
                    placeholder="Search"
                    underlineColorAndroid="transparent"
                    onChangeText={text => this.props.onSearch(text)}
                />
                </View>
            </View>
                <EntryListView
                    pool={this.props.pool}
                    data={this.props.data}
                    navigator={this.props.navigator}
                    entriesForUser={this.props.entriesForUser}
                    onEntryStatusChange={() => {
                        this.props.dispatch({
                            type: 'SHOW_ACTIVITY_INDICATOR',
                            text: 'Updating entries...'
                        });
                    }}
                />
                        <ActivityIndicator
          animate={this.props.activityIndicator.show}
          text={this.props.activityIndicator.loadingText}
        />
                </SPModalBody>
            </SPModal>
        )
    }
}

const styles = StyleSheet.create({
    input: {
        fontFamily: 'Avenir',
        color: '#333333',
        height: Platform.OS === 'android' ? 35 : 30,
        fontSize: 14
    }
});

export default connect((store) => {
  return store;
})(Search);