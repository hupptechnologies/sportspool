const loginActions = require('./login')
const entriesActions = require('./entries')

module.exports = {
  ...loginActions,
  ...entriesActions
}
