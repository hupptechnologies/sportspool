export function loadUserNotificationSettings() {
  return (dispatch) => {
    // dispatch({
    //   type: 'SET_NOTIFICATION_SETTINGS',
    //   settings: {
    //     'Notification Type': [{
    //       id: '1',
    //       name: 'Push',
    //       enabled: true,
    //       value: false
    //     }, {
    //       id: '2',
    //       name: 'SMS/Text',
    //       enabled: true,
    //       value: false
    //     }, {
    //       id: '3',
    //       name: 'Push & SMS/Text',
    //       enabled: true,
    //       value: false
    //     }],
    //     'Notifications': [{
    //       id: '4',
    //       name: 'Pick Confirmation',
    //       description: "You'll receive a notification when you've enetered all required picks.",
    //       enabled: true,
    //       value: false
    //     }, {
    //       id: '5',
    //       name: 'Another Setting',
    //       enabled: true,
    //       value: true
    //     }]
    //   }
    // });
  };
}

export function changeNotificationSetting(setting, value) {
  // TODO: API Update
  return (dispatch) => {
    dispatch({
      type: 'UPDATE_NOTIFICATION_SETTING',
      setting,
      value
    });
  };
}
