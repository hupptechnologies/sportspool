const initialState = {
  token: null,
  expiration: null
};

const auth = (state = initialState, action) => {
  switch (action.type) {
    case 'CLEAR_TOKEN':
      return initialState;
    case 'SET_TOKEN':
      return {...state, token: action.token}
    default:
      return state
  }
}

export default auth;
