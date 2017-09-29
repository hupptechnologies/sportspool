import API from '../api';

export function addLinkSubmission(link) {
  return (dispatch) => {
    dispatch({
      type: 'ADD_SUBMISSION',
      link
    });
  };
}

export function registerInvite(token, link) {
  if (!link) {
    return () => {};
  }

  return (dispatch) => {
    API.POST('/invitations', { link }, token).then((json) => {
      dispatch({
        type: 'REMOVE_SUBMISSION',
        link
      });

      dispatch({
        type: 'SET_INVITATIONS',
        invitations: [json]
      });
    }).catch((error) => {
      // TODO: Handle error
    })
  };
}

export function declineInvitation(invitation, token) {
  return (dispatch) => {
    API.POST(`/invitations/${invitation._id}/decline`, {}, token)
    .then(json => {
      dispatch({
        type: 'UPDATE_INVITATION',
        invitation: json
      });
    })
    .catch(err => {
      alert(err.message);
    })
  };
}

export function getInvitations(token) {
  return (dispatch) => {
    API.GET('/invitations', {}, token).then((json) => {
      dispatch({
        type: 'SET_INVITATIONS',
        invitations: json.data
      });
    }).catch((error) => {
      // TODO: Handle error
    });
  };
}

export async function generateInvitation(pool, token) {
  return API.GET(`/pools/${pool._id}/invitation`, {}, token);
}

export async function registerPoolLink(link, token) {
  return API.POST(`/invitations`, { link } , token);
}
