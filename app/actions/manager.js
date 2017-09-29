import _ from 'underscore';
import API from '../api';


export function getAllEntries(poolID, token) {
  return (dispatch) => {
    API.GET(`/pools/${poolID}/entries`, {}, token)
      .then(json => {
        dispatch({
          type: 'ADD_MANAGER_ENTRIES',
          poolID,
          entries: json.data
        });
      })
      .catch(error => {
        alert(error.message);
      });
  }
}

export async function loadUsersEntries(poolID, userID, token) {
  return API.GET(`/users/${userID}/entries`, {
    poolID
  }, token);
}

export const ENTRY_STATUSES = {
  'pending': 'Pending',
  'activated': 'Activate (Tentative)',
  'activated_paid': 'Activate (Final)',
  'rejected': 'Rejected'
};

export const PENDING_STATUS = ['Activate (Tentative)', 'Activate (Final)', 'Reject'];
export const ACTIVATED_STATUS = ['Activate (Final)', 'Reject'];
export const ACTIVATED_PAID_STATUS = ['Activate (Tentative)', 'Reject'];
export const REJECTED_STATUS = ['Activate (Tentative)', 'Activate (Final)'];

export function availableEntryStatusChanges(entries) {
  var statuses = [];
  _.keys(_.groupBy(entries, e => e.poolStatus)).forEach((key) => {
    if (key == 'pending') {
      statuses.push(PENDING_STATUS);
    } else if (key == 'activated') {
      statuses.push(ACTIVATED_STATUS);
    } else if (key == 'activated_paid') {
      statuses.push(ACTIVATED_PAID_STATUS);
    } else if (key == 'rejected') {
      statuses.push(REJECTED_STATUS);
    }
  });

  return _.intersection(...statuses);
};

export function changeEntriesStatus(poolID, entries, status, token) {
  return (dispatch) => {
    API.POST(`/pools/${poolID}/entries/status`, {
      entries: entries.map(e => `${e._id}`).join(','),
      poolStatus: status
    }, token)
    .then(json => {
      dispatch({
        type: 'CHANGE_ENTRIES_POOL_STATUS',
        entries: json.data,
        status,
        poolID
      })
    })
    .catch(error => {
      // TODO: Handle error
    });
  };
}

export function groupEntries(entries) {
  var obj = {'pending': { entries: [] }, 'activated': { entries: [] }, 'activated_paid': { entries: [] }, 'rejected': { entries: [] }, 'won': []};

  entries.forEach(e => {
    if (obj[e.poolStatus]) {
      obj[e.poolStatus].entries.push(e)
    } else if (obj[e.status]) {
      obj[e.status].entries.push(e);
    }
  });

  var res = {};

  const winning = obj['won'].entries;
  if (winning.length > 0) {
    res['Winning Entries'] = winning;
  }

  res['Pending'] = obj['pending'].entries;
  res['Activated, Tentative'] = obj['activated'].entries;
  res['Activated, Final'] = obj['activated_paid'].entries;
  res['Rejected'] = obj['rejected'].entries;

  return res;
}
