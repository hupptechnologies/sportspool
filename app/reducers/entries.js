import _ from 'lodash';

const initialState = [];

const entries = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_ENTRIES':
      return _(state).differenceBy(action.entries, '_id').concat(action.entries).value();
    case 'ARCHIVE_ENTRY':
      return state.map(entry => {
        if (entry._id == action.entry._id) {
          return action.entry;
        }

        return entry;
      });
    case 'CREATE_PICK':
      var newState = state.map((entry) => {
        if (entry._id == action.entry._id) {
          return {
            ...entry,
            picks: [...entry.picks, action.pick]
          }
        }

        return entry;
      });
      return newState;
    case 'SWITCH_PICK':
    var newState = state.map((entry) => {
      if (entry._id == action.entry._id) {
        var picks = entry.picks.filter(p => p._id != action.oldPick._id);
        picks.push(action.pick)
        return {
          ...entry,
          picks: picks
        }
      }

      return entry;
    });
    return newState;
    case 'DELETE_PICK':
      var newState = state.map((entry) => {
        if (entry._id == action.entry._id) {
          return {
            ...entry,
            picks: entry.picks.filter(p => p._id != action.pick._id)
          }
        }

        return entry;
      });
      return newState;
    case 'CLEAR_ENTRIES':
      return initialState;
    default:
      return state
  }
}

export default entries;
