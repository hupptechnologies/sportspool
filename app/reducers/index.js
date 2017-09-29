import { combineReducers } from 'redux';
import config from './config';
import auth from './auth';
import user from './user';
import entries from './entries';
import { pools, poolStats } from './pools';
import invitations from './invitations';
import manager from './manager';
import threads from './threads';
import notificationSettings from './notificationSettings';
import activityIndicator from './activityIndicator';
import notifications from './notifications';

export default combineReducers({
  config,
  auth,
  user,
  entries,
  invitations,
  manager,
  threads,
  notificationSettings,
  pools,
  poolStats,
  activityIndicator,
  notifications
});
