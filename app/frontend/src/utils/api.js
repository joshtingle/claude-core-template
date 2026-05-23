const BASE = '/api'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const qs = (params) => new URLSearchParams(
  Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
).toString()

// Populate this object with project-specific endpoint groups. Example:
//
//   export const api = {
//     overview: {
//       summary: (from, to) => apiFetch(`/overview/summary?${qs({ from, to })}`),
//     },
//     admin: {
//       dataCurrency: () => apiFetch('/admin/data-currency'),
//       refresh:      () => apiFetch('/admin/refresh', { method: 'POST' }),
//     },
//   }
//
// The admin endpoints below are wired by default since the backend ships them.
export const api = {
  admin: {
    snapshotStatus:  () => apiFetch('/admin/snapshot-status'),
    snapshotHistory: () => apiFetch('/admin/snapshot-history'),
    dataCurrency:    () => apiFetch('/admin/data-currency'),
    refresh:         () => apiFetch('/admin/refresh', { method: 'POST' }),
  },
}
