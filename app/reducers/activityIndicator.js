const initialState = {
  show: false,
  text: ""
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SHOW_ACTIVITY_INDICATOR':
      return { show: true, text: action.text };
    case 'HIDE_ACTIVITY_INDICATOR':
    default:
      return initialState;
  }
};
