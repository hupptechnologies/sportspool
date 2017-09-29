import React from 'React';
import SPApp from './SPApp';

import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

import codePush from 'react-native-code-push';

const setup = () => {
  class Root extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        isLoading: true,
        store: configureStore(() => this.setState({isLoading: false})),
      };
    }

    render() {
      return (
        <Provider store={this.state.store}>
          <SPApp />
        </Provider>
      );
    }
  }

  return codePush({
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME
  })(Root);
};

export default setup;
