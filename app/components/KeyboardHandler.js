/**
 * Based on http://stackoverflow.com/a/33585501/1783214
 *
 * Handle resizing enclosed View and scrolling to input
 * Usage:
 *    <KeyboardHandler ref='kh' offset={50}>
 *      <View>
 *        ...
 *        <TextInput ref='username'
 *          onFocus={()=>this.refs.kh.inputFocused(this,'username')}/>
 *        ...
 *      </View>
 *    </KeyboardHandler>
 *
 *  offset is optional and defaults to 34
 *  Any other specified props will be passed on to ScrollView
 */
'use strict';
import React, {Component} from 'react';

import ReactNative, {
    Keyboard,
    ScrollView,
    View,
    DeviceEventEmitter,
    TouchableWithoutFeedback
} from 'react-native';

class KeyboardHandler extends Component {
    constructor(props) {
        super(props);
        this.state = {keyboardSpace: 0};
        this.focused = null;
        this._didShowListener = null;
        this._willHideListener = null;
    }

    onKeyboarDidShow(frames) {
        if (!frames.endCoordinates || !this.focused) {
            return;
        }
        this.setState({keyboardSpace: frames.endCoordinates.height});
        let scrollResponder = this.refs.scrollView.getScrollResponder();
        scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
            this.focused,
            this.props.offset, //additionalOffset
            true
        );
    }

    onKeyboardWillHide() {
        this.setState({keyboardSpace: 0});
    }

    componentWillMount() {
        this._didShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboarDidShow.bind(this));
        this._willHideListener = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide.bind(this));

        this.scrollviewProps = {
            automaticallyAdjustContentInsets: true,
            keyboardShouldPersistTaps: "always",
            scrollEventThrottle: 200,
        };
        // pass on any props we don't own to ScrollView
        Object.keys(this.props).filter((n) => {
            return n != 'children'
        }).forEach((e) => {
            this.scrollviewProps[e] = this.props[e]
        });
    }

    componentWillUnmount() {
        this._didShowListener.remove();
        this._willHideListener.remove();
    }

    render() {
      return (
        <ScrollView ref='scrollView' {...this.scrollviewProps}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            {this.props.children}
          </TouchableWithoutFeedback>
          <View style={{ height: this.state.keyboardSpace }}/>
        </ScrollView>
      );
    }

    inputFocused(_this, refName) {
        this.focused = ReactNative.findNodeHandle(_this.refs[refName]);
    }

    static propTypes = {
        offset: React.PropTypes.number
    };

    static defaultProps = {
        offset: 0
    };
}

export default KeyboardHandler;
