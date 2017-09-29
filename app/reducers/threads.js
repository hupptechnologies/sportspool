import _ from 'lodash';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_THREADS':
      return _(state)
        .differenceBy(action.threads, '_id')
        .concat(action.threads)
        .sortBy(thread => thread.created)
        .value();
    case 'UPDATE_THREAD':
      return state.map(thread => {
        if (thread._id == action.thread._id) {
          return action.thread;
        }

        return thread;
      });
    case 'CLEAR_THREADS':
      return initialState;
    default:
      return state;
  }
};
