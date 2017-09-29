const initialState = [];

const notifications = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return state.concat([action.data]);
    case 'REMOVE_NOTIFICATION':
      return state.filter(notification => notification.id != action.id);
    case 'CLEAR_NOTIFICATIONS':
      return initialState;
    default:
      return state
  }
}

export default notifications;
