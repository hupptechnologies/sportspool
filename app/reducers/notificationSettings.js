import _ from 'underscore';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION_SETTINGS':
      return action.settings;
    case 'UPDATE_NOTIFICATION_SETTING':
      var newState = {...state};
      _.each(state, (val, key) => {
        newState = {
          ...newState,
          [key]: val.map((setting) => {
            if (setting.id == action.setting.id) {
              return {...setting, value: action.value};
            }

            return setting;
          })
        };
      });
      return newState;
    case 'CLEAR_NOTIFICATION_SETTINGS':
      return initialState;
    default:
      return state;
  }
};
