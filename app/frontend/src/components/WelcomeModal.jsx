import { useState, useEffect } from 'react'
import ReleaseNotesModal from './ReleaseNotesModal.jsx'

const STORAGE_KEY = 'isw-__PROJECT_SLUG__-welcome-seen-v1'

// Page directory shown in the welcome modal. Edit this as you add pages.
// status options: 'live' (green pill), 'live_dev' (blue pill), 'coming' (gray pill).
const PAGES = [
  // Example entry -- replace with real pages or empty this array.
  // {
  //   icon: 'fa-light fa-gauge-high',
  //   label: 'Overview',
  //   route: '/overview',
  //   color: '#31AB46',
  //   description: 'High-level KPIs and trend summary.',
  //   status: 'live_dev',
  // },
]

export default function WelcomeModal({ open, onOpen, onClose }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [activeCard, setActiveCard] = useState(null)
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      setVisible(true)
      if (onOpen) onOpen()
    }
  }, [])

  useEffect(() => {
    if (open && !visible) setVisible(true)
  }, [open])

  function dismiss() {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      localStorage.setItem(STORAGE_KEY, '1')
      if (onClose) onClose()
    }, 380)
  }

  // Close welcome modal and open Release Notes as a secondary view.
  function openReleaseNotes() {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      localStorage.setItem(STORAGE_KEY, '1')
      if (onClose) onClose()
      setReleaseNotesOpen(true)
    }, 380)
  }

  if (!visible && !releaseNotesOpen) return null
  if (!visible) {
    return (
      <ReleaseNotesModal open={releaseNotesOpen} onClose={() => setReleaseNotesOpen(false)} />
    )
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) dismiss() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,12,20,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: closing ? 'fadeOut 380ms ease forwards' : 'fadeIn 300ms ease',
      }}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0)   scale(1) }
        }
        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0)   scale(1) }
          to   { opacity: 0; transform: translateY(28px) scale(0.97) }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        .welcome-card:hover .card-arrow { opacity: 1; transform: translateX(0) }
        .welcome-card:hover              { border-color: var(--card-color) !important; }
      `}</style>

      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%', maxWidth: 900,
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 4px 20px rgba(0,0,0,0.14)',
        display: 'flex', flexDirection: 'column',
        animation: closing ? 'slideDown 380ms cubic-bezier(0.4,0,1,1) forwards' : 'slideUp 400ms cubic-bezier(0.16,1,0.3,1)',
      }}>

        <div style={{
          background: '#1E2556',
          padding: '28px 36px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(49,171,70,0.08)',
          }} />
          <div style={{
            position: 'absolute', right: 60, top: 20,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(0,122,201,0.08)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(223,172,45,0.18)',
                border: '1px solid rgba(223,172,45,0.35)',
                borderRadius: 999, padding: '3px 10px',
                marginBottom: 12,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#DFAC2D', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#DFAC2D', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Beta</span>
              </div>

              <h1 style={{
                color: '#fff', fontSize: 26, fontWeight: 700,
                letterSpacing: '-0.02em', lineHeight: 1.2,
                fontFamily: 'Poppins, sans-serif', margin: 0,
              }}>
                __PROJECT_NAME__
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.55)', fontSize: 13,
                margin: '6px 0 0', fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.5,
              }}>
                insightsoftware . Enterprise Data
              </p>
            </div>

            <button
              onClick={dismiss}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, color: 'rgba(255,255,255,0.5)',
                width: 32, height: 32, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 120ms',
                fontFamily: 'Poppins, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            >
              <i className="fa-light fa-xmark" style={{ fontSize: 13 }} />
            </button>
          </div>

          <div style={{
            marginTop: 18,
            background: 'rgba(223,172,45,0.10)',
            border: '1px solid rgba(223,172,45,0.22)',
            borderRadius: 10, padding: '12px 16px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <i className="fa-light fa-triangle-exclamation" style={{ color: '#DFAC2D', fontSize: 14, marginTop: 1, flexShrink: 0 }} />
            <p style={{
              color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0,
              fontFamily: 'Poppins, sans-serif', lineHeight: 1.6,
            }}>
              This dashboard is an active work in progress. Data, calculations, and page availability are still being validated. Numbers should be treated as directional until formal sign-off.
            </p>
          </div>
        </div>

        <div style={{ padding: '24px 36px 28px', overflowY: 'auto' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: '#9CA3AF',
            margin: '0 0 14px', fontFamily: 'Poppins, sans-serif',
          }}>
            What's in this dashboard
          </p>

          {PAGES.length === 0 && (
            <p style={{ fontSize: 13, color: '#6B7280', fontFamily: 'Poppins, sans-serif', margin: 0 }}>
              Pages will appear here as they are added. Edit the <code>PAGES</code> array in <code>WelcomeModal.jsx</code>.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAGES.map((page, i) => (
              <div
                key={page.route}
                className="welcome-card"
                style={{
                  '--card-color': page.color,
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #E5E7EB',
                  background: activeCard === i ? '#F9FAFB' : '#fff',
                  cursor: 'default',
                  transition: 'all 180ms ease',
                  animation: `cardIn 400ms ${80 + i * 60}ms cubic-bezier(0.16,1,0.3,1) both`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={() => setActiveCard(i)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 3, borderRadius: '3px 0 0 3px',
                  background: page.color,
                  opacity: activeCard === i ? 1 : 0,
                  transition: 'opacity 180ms',
                }} />

                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: `${page.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={page.icon} style={{ color: page.color, fontSize: 15 }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: '#1E2556',
                      fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em',
                    }}>
                      {page.label}
                    </span>
                    {page.status === 'coming' && (
                      <span style={{
                        fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: '#9CA3AF',
                        background: '#F3F4F6', borderRadius: 4, padding: '2px 6px',
                      }}>
                        Coming soon
                      </span>
                    )}
                    {page.status === 'live' && (
                      <span style={{
                        fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: '#31AB46',
                        background: '#F0FDF4', borderRadius: 4, padding: '2px 6px',
                      }}>
                        Live
                      </span>
                    )}
                    {page.status === 'live_dev' && (
                      <span style={{
                        fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: '#007AC9',
                        background: '#EFF8FF', borderRadius: 4, padding: '2px 6px',
                      }}>
                        Live - In Dev
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12, color: '#6B7280', margin: 0,
                    fontFamily: 'Poppins, sans-serif', lineHeight: 1.55,
                  }}>
                    {page.description}
                  </p>
                </div>

                <div
                  className="card-arrow"
                  style={{
                    color: page.color, flexShrink: 0, alignSelf: 'center',
                    opacity: 0, transform: 'translateX(-4px)',
                    transition: 'all 180ms ease',
                  }}
                >
                  <i className="fa-light fa-arrow-right" style={{ fontSize: 13 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '16px 36px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20,
        }}>
          <span style={{
            fontSize: 11, color: '#9CA3AF',
            fontFamily: 'Poppins, sans-serif',
            flex: 1, minWidth: 0, lineHeight: 1.5,
          }}>
            This message won't appear again automatically -- but it's always available from the <strong style={{ color: '#6B7280', fontWeight: 600 }}>About</strong> link in the sidebar.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              onClick={openReleaseNotes}
              style={{
                background: 'transparent', color: '#1E2556',
                border: '1px solid #D1D5DB', borderRadius: 8,
                padding: '8px 16px', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                letterSpacing: '-0.01em',
                transition: 'all 140ms',
                display: 'flex', alignItems: 'center', gap: 7,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#9CA3AF' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#D1D5DB' }}
            >
              <i className="fa-light fa-rectangle-history" style={{ fontSize: 11 }} />
              Release Notes
            </button>
            <button
              onClick={dismiss}
              style={{
                background: '#1E2556', color: '#fff',
                border: 'none', borderRadius: 8,
                padding: '9px 22px', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                letterSpacing: '-0.01em',
                transition: 'background 140ms',
                display: 'flex', alignItems: 'center', gap: 7,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a3470'}
              onMouseLeave={e => e.currentTarget.style.background = '#1E2556'}
            >
              Get started
              <i className="fa-light fa-arrow-right" style={{ fontSize: 11 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
