import React from 'react'

export function PageShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ padding: '28px 28px 40px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
            margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2,
          }}>{title}</h1>
          {subtitle && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12.5, margin: '4px 0 0', letterSpacing: '-0.005em' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Section({ title, subtitle, actions, children, style, stretch }) {
  return (
    <div className="card" style={{
      marginBottom: 0,
      ...(stretch ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}),
      ...style,
    }}>
      {(title || actions) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 18px 12px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>{title}</span>
            {subtitle && (
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 400 }}>
                . {subtitle}
              </span>
            )}
          </div>
          {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function Grid({ cols = 4, gap = 14, children, style }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap, ...style }}>
      {children}
    </div>
  )
}

export function TwoCol({ left, right, leftWidth = '60%' }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `minmax(0, ${leftWidth}) minmax(0, 1fr)`,
      gap: 14, alignItems: 'stretch',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>{left}</div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>{right}</div>
    </div>
  )
}

export function LoadingState({ rows = 5 }) {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 32, borderRadius: 6, opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF1EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <i className="fa-light fa-circle-exclamation" style={{ fontSize: 20, color: 'var(--color-negative)' }} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Failed to load data</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{message}</div>
    </div>
  )
}

export function EmptyState({ message = 'No data available', icon = 'fa-light fa-inbox' }) {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <i className={icon} style={{ fontSize: 20, color: 'var(--text-muted)' }} />
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{message}</div>
    </div>
  )
}
