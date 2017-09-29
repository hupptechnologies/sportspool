import React, { Component } from 'react';

import {
  View,
  WebView
} from 'react-native';

import {
  SPModal,
  SPModalHeader,
  SPModalBody,
  SPModalFooter,
  SPModalButton
} from '../../common/SPModal';

import {
  SPText,
  SPMediumText
} from '../../common/SPText';
import TabView from '../TabView';

class Legal extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SPModal>
        <SPModalHeader
          title="The Fine Print"
          leftComponent={<SPModalButton icon="ios-close" onPress={() => this.dismiss()}/>}
        />
        <SPModalBody>
          <TabView
            routes={[
              <WebView source={{uri: 'http://sportspool.honormountain.com/termsandconditions.html'}} />,
              <WebView source={{uri: 'http://sportspool.honormountain.com/privacy.html'}} />
            ]}
            tabs={['Terms & Conditions', 'Privacy Policy']}
          />
        </SPModalBody>
      </SPModal>
    )
  }

  dismiss() {
    this.props.navigator.pop()
  }

}

export default Legal;
