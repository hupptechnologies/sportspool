import API from '../api';

export const GROUPS = {
  'Players with Missing Picks': 'no picks',
  'Players with entries Activated (Tentative)': 'unpaid',
  'All Players': 'users'
};

export const PGA_GROUPS = {
  'All Players': 'users',
  'Players with entries Activated (Tentative)': 'unpaid'
};

export function getThreads(pool, token) {
  return (dispatch) => {
    API.GET(`/pools/${pool._id}/threads`, {}, token)
    .then(json => {
      dispatch({
        type: 'ADD_THREADS',
        threads: json.threads
      });
    })
    .catch(err => alert(err.message));
  };
}

export function getThreadMessages(pool, thread, token) {
  return API.GET(`/pools/${pool._id}/threads/${thread._id}/comments`, {}, token);
}

export async function createThread(pool, body, token) {
  return API.POST(`/pools/${pool._id}/threads`, body, token);
}

export function createMessage(thread, message, token) {
  return (dispatch) => {
    API.POST(`/pools/${thread.pool._id}/threads/${thread._id}/comments`, {
      message
    }, token)
    .then(json => {
      dispatch({
        type: 'UPDATE_THREAD',
        thread: json.thread
      });

      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
    })
    .catch(err => {
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });

      alert(err.message)
    });
  };
}
