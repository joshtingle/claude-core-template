import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemePicker() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = themes.find(t => t.id === theme) || themes[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Change theme"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          color: '#fff',
          padding: '5px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontFamily: 'inherit',
          transition: 'background 150ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      >
        <i className="fa-light fa-palette" style={{ fontSize: 13 }} />
        <span>{current.label}</span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 9, opacity: 0.7 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 10,
          boxShadow: 'var(--shadow-elevated)',
          padding: 6,
          minWidth: 160,
          zIndex: 1000,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px 8px' }}>
            Appearance
          </div>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '7px 10px',
                borderRadius: 7,
                border: 'none',
                background: t.id === theme ? 'var(--surface-muted)' : 'transparent',
                color: t.id === theme ? 'var(--isw-navy)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: t.id === theme ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => { if (t.id !== theme) e.currentTarget.style.background = 'var(--surface-muted)' }}
              onMouseLeave={e => { if (t.id !== theme) e.currentTarget.style.background = 'transparent' }}
            >
              <i className={t.icon} style={{ fontSize: 13, width: 16, textAlign: 'center' }} />
              {t.label}
              {t.id === theme && <i className="fa-solid fa-check" style={{ fontSize: 10, marginLeft: 'auto', color: 'var(--isw-green)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
