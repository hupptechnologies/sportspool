import API from '../api';

export function updateUser(user, params, token) {
  return (dispatch) => {
    API.PUT(`/users/${user._id}`, params, token)
    .then(user => {
      dispatch({
        type: 'UPDATE_USER',
        user: user
      });

      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
    })
    .catch(err => {
      alert(err.message);
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
    });
  }
}

export function logout() {
  return (dispatch) => {
    // FIXME: Probably not good.
    const types = ['CLEAR_TOKEN', 'CLEAR_USER', 'CLEAR_ENTRIES', 'CLEAR_CHAT', 'CLEAR_INVITATIONS', 'CLEAR_MANAGER', 'CLEAR_NOTIFICATION_SETTINGS', 'CLEAR_POOLS', 'CLEAR_NOTIFICATIONS', 'CLEAR_THREADS'];
    types.forEach(type => dispatch({type}) );
  }
}

export async function registerToken(user, token) {

}
