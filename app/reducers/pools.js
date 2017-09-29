import _ from 'lodash';

const poolStats = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_POOL_STATS':
      return _.merge({}, state, {[action.poolId]: action.stats})
    default:
      return state;
  }
}

const pools = (state = [], action) => {
  switch (action.type) {
    case 'ADD_POOL':
      return [...state, action.pool];
    case 'UPDATE_POOL':
      return _(state).reject(['_id', action.pool._id]).concat(action.pool);
    case 'CLEAR_POOLS':
      return [];
    case 'SET_POOLS':
      return action.pools;
    default:
      return state;
  }
}

export {pools, poolStats};
