import 'react-native';
import React from 'react';
import { createStore } from 'redux';
import renderer from 'react-test-renderer';

import reducer from '../app/reducers/entries';

describe('reducer', () => {
  let store = createStore(reducer);

  it('should update existing entries', () => {
    const entries = [{
      _id: 1,
      status: 'pending'
    }, {
      _id: 2,
      status: 'pending'
    }];

    store.dispatch({
      type: 'ADD_ENTRIES',
      entries: entries
    });

    store.dispatch({
      type: 'ADD_ENTRIES',
      entries: [{
        _id: 1,
        status: 'activated'
      }]
    });

    expect(store.getState()).toMatchObject([{
      _id: 2,
      status: 'pending'
    }, {
        _id: 1,
        status: 'activated'
      }
    ]);

  });

  it('should add entries', () => {
    const entries = [{id:'1'},{id:'2'}];
    store.dispatch({
      type: 'ADD_MANAGER_ENTRIES',
      poolID: '1',
      entries: entries
    });

    expect(store.getState()).toMatchObject({
      entries: {
        '1': entries
      },
      users: {}
    });
  });
});
