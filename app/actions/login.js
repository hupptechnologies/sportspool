import API from '../api';

async function sendSignupVerificationLink(params) {
  return API.POST('/auth/verify', params)
}

async function verifySignupLink(url) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 3000)
  })
}

function login(value, password) {
  return (dispatch) => {
    API.POST('/auth/login', {
      email: value,
      password: password
    }).then((json) => {
      // Must set `user` before setting `token` or `user` will be empty during Component rendering between dispatch calls.
      dispatch({
        type: 'USER_LOGGED_IN',
        user: json.user
      });

      dispatch({
        type: 'SET_TOKEN',
        token: json.token
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

function signup(user) {
  return (dispatch) => {
    API.POST('/auth/signup', user).then(json => {
      dispatch({
        type: 'USER_LOGGED_IN',
        user: json.user
      });

      dispatch({
        type: 'SET_TOKEN',
        token: json.token
      });
    }).catch(error => {
      dispatch({
        type: 'HIDE_ACTIVITY_INDICATOR'
      });

      alert(error.message);
    });
  }
}

async function sendPasswordResetLink(email) {
  return API.POST('/auth/sendPasswordResetLink', { email });
}

async function resetPassword(email, code, password, confirmPassword) {
  return API.POST('/auth/passwordReset', {
    email,
    code,
    password,
    confirmPassword
  });
}

export {
  sendSignupVerificationLink,
  verifySignupLink,
  login,
  signup,
  sendPasswordResetLink,
  resetPassword
}
