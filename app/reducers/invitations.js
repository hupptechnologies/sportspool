const initialState = {
  waitingSubmission: null, // Invitation link waiting to be registered with server
  all: []
};

const invitations = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_SUBMISSION':
      return { ...state, waitingSubmission: action.link }
    case 'REMOVE_SUBMISSION':
      return { ...state, waitingSubmission: null }
    case 'SET_INVITATIONS':
      return { ...state, all: action.invitations };
    case 'ADD_INVITATION':
      return {...state, all: [
        ...state.all.filter(i => i._id != action.invitation._id),
        ...[action.invitation]
      ]};
    case 'UPDATE_INVITATION':
      return {
        ...state,
        all: state.all.map(invitation => {
          if (invitation._id == action.invitation._id) {
            return action.invitation;
          }

          return invitation;
        })
      }
    case 'CLEAR_INVITATIONS':
      return initialState;
    default:
      return state
  }
}

export default invitations;
