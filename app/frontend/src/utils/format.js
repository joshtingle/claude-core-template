// Display formatting utilities only -- no business logic.
// Projects that need currency formatting (e.g., ARR, revenue) should add their
// own formatARR / formatUSD helper and pass it to KpiCard via the `formatter` prop.

export function parseDate(str) {
  if (!str) return null
  const parts = String(str).split('T')[0].split('-')
  if (parts.length < 3) return null
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
}

export function formatPct(value, decimals = 1) {
  if (value == null) return '—'
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatPctDirect(value, decimals = 1) {
  if (value == null) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

export function formatNumber(value) {
  if (value == null) return '—'
  return Math.round(value).toLocaleString()
}

export function formatMonth(dateStr) {
  if (!dateStr) return '—'
  const d = parseDate(dateStr)
  if (!d || isNaN(d.getTime())) return String(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = parseDate(dateStr)
  if (!d || isNaN(d.getTime())) return String(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelativeMonth(dateStr) {
  if (!dateStr) return '—'
  const d = parseDate(dateStr)
  if (!d || isNaN(d.getTime())) return String(dateStr)
  const now = new Date()
  const diffMonths = (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth()
  if (diffMonths === 0)  return 'This month'
  if (diffMonths === -1) return 'Last month'
  if (diffMonths < 0)   return `${Math.abs(diffMonths)}mo ago`
  if (diffMonths === 1) return 'Next month'
  return `In ${diffMonths}mo`
}

export function deltaPct(current, prior) {
  if (current == null || !prior || prior === 0) return null
  return ((current - prior) / Math.abs(prior)) * 100
}
