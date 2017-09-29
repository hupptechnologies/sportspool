const initialState = {

};

const user = (state = initialState, action) => {
  switch (action.type) {
    case 'USER_LOGGED_IN':
      return action.user;
    case 'UPDATE_USER':
      return {...state, ...action.user};
    case 'CLEAR_USER':
      return initialState;
    case 'NEW_POOL_CREATED':
      return {...state, pools: [...state.pools, action.pool]};
    default:
      return state
  }
}

export default user;
