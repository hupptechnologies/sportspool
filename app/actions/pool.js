import API from '../api';

export async function loadCreatePoolOptions() {
  return API.GET('/pools/options', {})
}

export async function createPool(params, token) {
  return API.POST(`/pools`, params, token)
}

export async function updatePool(id, params, token) {
  return API.PUT(`/pools/${id}`, params, token)
}

export function getPools(token) {
  return API.GET(`/pools`, {}, token)
}

export function getPoolStats(poolId) {
  return API.GET(`/pools/${poolId}/stats`, {})
}

export async function getPoolOverview(pool, filter) {
  return API.GET(`/pools/${pool._id}/overview`, { filter });
}

export async function getPendingEntries(pool, token) {
  return API.GET(`/pools/${pool._id}/entries`, { poolStatus: 'pending' }, token);
}

export async function loadGames(pool) {
  return API.GET(`/pools/${pool._id}/games`, {});
}

export async function getGolfers(pool) {
  return API.GET(`/pools/${pool._id}/golfers`, {});
}

export async function getAudit(pool, token) {
  return API.GET(`/pools/${pool._id}/audit.csv`, {}, token);
}
