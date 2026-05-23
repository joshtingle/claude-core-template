import React from 'react'
import { formatNumber, formatPct, deltaPct } from '../../utils/format.js'

// Generic KPI card. Pass `value` as a number with `format` ('number' | 'pct' |
// 'ratio' | 'raw') OR pass a pre-formatted string + format='raw' for full
// control. The `formatter` prop lets a project plug in its own currency
// formatter (e.g., formatARR for an ARR dashboard) without coupling this
// component to a specific currency convention.
export function KpiCard({
  label,
  value,
  format = 'number',
  formatter,
  prior,
  icon,
  trend,
  accentColor,
  onClick,
  loading,
  subtitle,
  breakdown,
  invertDelta,
  pctBadge,
  valueColor,
}) {
  const displayValue = () => {
    if (loading) return <span className="skeleton" style={{ display: 'block', height: 30, width: 110, borderRadius: 6 }} />
    if (formatter) return formatter(value)
    if (format === 'pct') return formatPct(value)
    if (format === 'number') return formatNumber(value)
    if (format === 'ratio') return value != null ? `${Number(value).toFixed(2)}x` : '—'
    return value ?? '—'
  }

  const delta = prior != null && value != null ? deltaPct(value, prior) : null
  const deltaGood = delta != null ? (invertDelta ? delta < 0 : delta > 0) : null
  const isPositive = trend === 'up' || (delta != null && deltaGood)
  const isNegative = trend === 'down' || (delta != null && !deltaGood && delta !== 0)
  const accent = accentColor || 'var(--isw-blue)'

  const formatBreakdownValue = (v) => {
    if (formatter) return formatter(v)
    if (format === 'pct') return formatPct(v)
    return formatNumber(v)
  }

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: '18px 20px 16px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow var(--t-base), transform var(--t-base)',
        borderTop: `2px solid ${accent}`,
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        background: `${accent}08`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
        <div style={{ maxWidth: icon ? 'calc(100% - 38px)' : '100%' }}>
          {subtitle && !loading && (
            <div style={{
              fontSize: 9.5, fontWeight: 600, color: accent,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, opacity: 0.75,
            }}>
              {subtitle}
            </div>
          )}
          <div style={{
            fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.4,
          }}>
            {label}
          </div>
        </div>
        {icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            background: `${accent}14`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={icon} style={{ fontSize: 12, color: accent }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, lineHeight: 1, marginBottom: 10, position: 'relative' }}>
        <span style={{
          fontSize: 27, fontWeight: 700, color: valueColor || 'var(--text-primary)',
          letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
        }}>
          {displayValue()}
        </span>
        {pctBadge && !loading && (
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
            | {pctBadge}
          </span>
        )}
      </div>

      {delta != null && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 6px', borderRadius: 4,
            background: isPositive ? '#EDFAF2' : isNegative ? '#FEF1EE' : 'var(--surface-muted)',
            color: isPositive ? 'var(--color-positive)' : isNegative ? 'var(--color-negative)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: 11,
          }}>
            <i className={`fa-solid fa-arrow-${Math.abs(delta) < 0.5 ? 'right' : delta > 0 ? 'up' : 'down'}-long`} style={{ fontSize: 8 }} />
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            vs prior ({formatBreakdownValue(prior)})
          </span>
        </div>
      )}

      {breakdown && !loading && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {breakdown.map(b => (
            <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
              <span>{b.label}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {formatBreakdownValue(b.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
