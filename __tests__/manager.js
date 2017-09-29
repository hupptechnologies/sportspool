import 'react-native';
import React from 'react';
import { createStore } from 'redux';
import renderer from 'react-test-renderer';

import {
  PENDING_STATUS,
  ACTIVATED_STATUS,
  ACTIVATED_PAID_STATUS,
  REJECTED_STATUS,
  availableEntryStatusChanges
} from '../app/actions/manager';

import reducer from '../app/reducers/manager';

describe('Changing entry status', () => {
  it('should return statuses for pending entries', () => {
    const entries = [{poolStatus:'pending'}];
    expect(availableEntryStatusChanges(entries)).toMatchObject(PENDING_STATUS);
  });

  it('should return statuses for activated entries', () => {
    const entries = [{poolStatus:'activated'}];
    expect(availableEntryStatusChanges(entries)).toMatchObject(ACTIVATED_STATUS);
  });

  it('should return statuses for paid entries', () => {
    const entries = [{poolStatus:'activated_paid'}];
    expect(availableEntryStatusChanges(entries)).toMatchObject(ACTIVATED_PAID_STATUS);
  });

  it('should return statuses for rejected entries', () => {
    const entries = [{poolStatus:'rejected'}];
    expect(availableEntryStatusChanges(entries)).toMatchObject(REJECTED_STATUS);
  });

  it('should return Reject status for pending, activated, and paid entries', () => {
    const entries = [{poolStatus:'pending'},{poolStatus:'activated'},{poolStatus:'activated_paid'}];
    expect(availableEntryStatusChanges(entries)).toMatchObject(['Reject']);
  });

  it('should return Activate and Activate & Paid statuses for pending and rejected entries', () => {
    const entries = [{poolStatus:'pending'},{poolStatus:'rejected'}];
    expect(availableEntryStatusChanges(entries)).toMatchObject(['Activate', 'Activate & Paid']);
  });
});

describe('reducer', () => {
  let store = createStore(reducer);

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

  it('shouldnt add duplicate entries', () => {
    const entries = [{id:'1'}];
    store.dispatch({
      type: 'ADD_MANAGER_ENTRIES',
      poolID: '1',
      entries: entries
    });

    expect(store.getState()).toMatchObject({
      entries: {'1': [{id:'1'},{id:'2'}]}, users: {}
    });
  });

  it('should clear entries', () => {
    store.dispatch({
      type: 'CLEAR_MANAGER_ENTRIES',
      poolID: '1'
    });
    expect(store.getState()).toMatchObject({
      entries: {'1': []}, users: {}
    });
  });

  it('should delete entry', () => {
    store.dispatch({
      type: 'ADD_MANAGER_ENTRIES',
      poolID: '1',
      entries: [{id:'1'},{id:'2'},{id:'3'}]
    });
    store.dispatch({
      type: 'REMOVE_MANAGER_ENTRIES',
      poolID: '1',
      entries: [{id:'2'},{id:'3'}]
    });
    expect(store.getState()).toMatchObject({
      entries: {'1':[{id:'1'}]}, users: {}
    });
  });

  it('should change pool status', () => {
    store = createStore(reducer);
    const entries = [{id:'1',poolStatus:'pending'},{id:'2',poolStatus:'pending'}];
    store.dispatch({
      type: 'ADD_MANAGER_ENTRIES',
      poolID: '1',
      entries: entries
    });
    store.dispatch({
      type: 'CHANGE_ENTRIES_POOL_STATUS',
      poolID: '1',
      entries: [{id:'1'}],
      status: 'activated'
    });

    expect(store.getState()).toMatchObject({
      entries: {'1':[{id:'1',poolStatus:'activated'},{id:'2',poolStatus:'pending'}]}, users: {}
    });
  });

});
