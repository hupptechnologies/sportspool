import _ from 'underscore';

/**
 * @desc Stores all entries and users in the user's managing pools. State keys
 * represent the pool IDs.
 */

const initialState = {
  entries: {}
};

const manager = (state = initialState, action) => {
  switch (action.type) {
    case 'CLEAR_MANAGER_ENTRIES':
      return {...state, entries: {...state.entries, [action.poolID]: []}};
    case 'REMOVE_MANAGER_ENTRIES':
      var ids = _.pluck(action.entries, '_id');
      var entries = state.entries[action.poolID].filter(e => !~ids.indexOf(e._id));

      return {...state, entries: {...state.entries, [action.poolID]: entries}};
    case 'ADD_MANAGER_ENTRIES':
      var entries = _.unique([...(state.entries[action.poolID] || []), ...action.entries], false, e => e._id);
      var obj = {...state.entries, [action.poolID]: entries };

      return {...state, entries: obj};
    case 'CHANGE_ENTRIES_POOL_STATUS':
      var entries = state.entries[action.poolID].map(e => {
        const found = _.find(action.entries, (k) => {
          return k._id == e._id;
        });

        if (found) {
          return {...e, ...{ poolStatus: action.status, updated: found.updated }};
        } else {
          return e;
        }
      });

      return {...state, entries: {...state.entries, [action.poolID]: entries}};
    case 'UPDATE_ENTRY_NAMES':
      var entries = state.entries[action.poolID].map(e => {
        const found = _.find(action.entries, (k) => {
          return k._id == e._id;
        });

        if (found) {
          return {
            ...e,
            name: found.name
          }
        }

        return e;
      });

      return {...state, entries: {...state.entries, [action.poolID]: entries}};
    case 'CLEAR_MANAGER':
      return initialState;
    default:
      return state
  }
}

export default manager;
