/* @flow */

import uuid from 'uuid'
import API from '../api';

export async function joinPool(params, token) {
  return API.POST('/entries', params, token);
}

export function getEntry(entry, token) {
  return new Promise(async (resolve, reject) => {
    try {
      const json = await API.GET(`/entries/${entry._id}`, {}, token);
      resolve(json);
    } catch(error) {
      reject(error.message);
    }
  })
}

export function createPick(entry, params, token) {
  return (dispatch) => {
    API.POST(`/entries/${entry._id}/picks`, params, token).then((pick) => {
      dispatch({
        type: 'CREATE_PICK',
        entry: entry,
        pick: pick
      });
    }).catch((error) => {
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
      alert(error.message);
    });
  }
}

export function switchPick(entry, pick, team, game, token) {
  return (dispatch) => {
    API.PUT(`/entries/${entry._id}/picks`, {
      pick: pick._id,
      team: team._id,
      game: game._id
    }, token).then((newPick) => {
      dispatch({
        type: 'SWITCH_PICK',
        entry: entry,
        pick: newPick,
        oldPick: pick
      });
    }).catch((error) => {
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
      alert(error.message);
    });
  }
}

export function deletePick(entry, pick, token) {
  return (dispatch) => {
    API.DELETE(`/entries/${entry._id}/picks`, {
      pick: pick._id
    }, token).then((pick) => {
      dispatch({
        type: 'DELETE_PICK',
        entry,
        pick
      })
    }).catch((error) => {
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
      alert(error.message);
    });
  }
}

export function managerCreatePick(entry, params, token) {
  return API.POST(`/entries/${entry._id}/picks`, params, token);
}

export function managerSwitchPick(entry, pick, team, game, token) {
  return API.PUT(`/entries/${entry._id}/picks`, {
    pick: pick._id,
    team: team._id,
    game: game._id
  }, token)
}

export function managerDeletePick(entry, pick, token) {
  return API.DELETE(`/entries/${entry._id}/picks`, {
    pick: pick._id
  }, token)
}

export function getEntries(token) {
  return async (dispatch) => {
    try {
      const json = await API.GET(`/entries`, {}, token);
      dispatch({
        type: 'ADD_ENTRIES',
        entries: json.data
      });
      } catch(error) {
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
      alert(error.message);
    }
  };
}

export async function editEntryNames(entries, token) {
  return API.PUT('/entries', {
    entries, token
  }, token)
}

export async function getArchivedEntries(token) {
  return API.GET('/entries/archived', {}, token);
}

export function archiveEntry(entry, token) {
  return (dispatch) => {
    API.POST(`/entries/${entry._id}/archive`, {}, token).then((entry) => {
      dispatch({
        type: 'ARCHIVE_ENTRY',
        entry
      });
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
    }).catch((error) => {
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });
      alert(error.message);
    });
  }
}
