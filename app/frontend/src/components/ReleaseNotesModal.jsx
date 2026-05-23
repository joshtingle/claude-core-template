import { useEffect, useState } from 'react'

// Per CLAUDE.md: update before every prod deploy. Newest entry on top. Group
// each release's items into category buckets so readers can scan by interest:
//   - "Core Functions" -- new capabilities, features, things you can now do
//   - "UI / UX"        -- visual, layout, theme, design, navigation
//   - "Business Logic" -- calculation fixes, KPI alignment, data accuracy
// Skip pure refactors, tests, dep bumps, and internal cleanup. Bullets read
// from the user's perspective, not the implementation's.
//
// Entry shape (uncomment and copy when adding a new release):
//   {
//     date: 'YYYY-MM-DD',
//     title: 'Short release title (prefer "improvement" over "polish")',
//     icon: 'fa-light fa-sparkles',   // any FA light icon
//     accent: '#007AC9',              // brand color hex
//     categories: {
//       'Core Functions': ['User-facing feature bullet'],
//       'UI / UX':        ['User-facing visual bullet'],
//       'Business Logic': ['User-facing calculation bullet'],
//     },
//   },
const RELEASES = [
  // Seed your first release entry here before the first prod deploy.
]

const CATEGORY_ORDER = ['Core Functions', 'UI / UX', 'Business Logic']
const CATEGORY_ICONS = {
  'Core Functions': 'fa-light fa-wand-magic-sparkles',
  'UI / UX':        'fa-light fa-palette',
  'Business Logic': 'fa-light fa-calculator',
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
}

export default function ReleaseNotesModal({ open, onClose }) {
  const [closing, setClosing] = useState(false)
  const [activeCard, setActiveCard] = useState(null)

  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') dismiss() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function dismiss() {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose?.()
    }, 380)
  }

  if (!open) return null

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) dismiss() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(10,12,20,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: closing ? 'rnFadeOut 380ms ease forwards' : 'rnFadeIn 300ms ease',
      }}
    >
      <style>{`
        @keyframes rnFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes rnFadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes rnSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes rnSlideDown {
          from { opacity: 1; transform: translateY(0) scale(1) }
          to   { opacity: 0; transform: translateY(28px) scale(0.97) }
        }
        @keyframes rnCardIn {
          from { opacity: 0; transform: translateY(12px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        .release-card:hover { border-color: var(--card-color) !important; }
      `}</style>

      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%', maxWidth: 900,
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 4px 20px rgba(0,0,0,0.14)',
        display: 'flex', flexDirection: 'column',
        animation: closing ? 'rnSlideDown 380ms cubic-bezier(0.4,0,1,1) forwards' : 'rnSlideUp 400ms cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Header band -- mirrors WelcomeModal's structure */}
        <div style={{
          background: '#1E2556',
          padding: '28px 36px 24px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Decorative background circles */}
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(0,122,201,0.08)',
          }} />
          <div style={{
            position: 'absolute', right: 60, top: 20,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(49,171,70,0.08)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,122,201,0.18)',
                border: '1px solid rgba(0,122,201,0.35)',
                borderRadius: 999, padding: '3px 10px',
                marginBottom: 12,
              }}>
                <i className="fa-light fa-rectangle-history" style={{ color: '#00B9FF', fontSize: 10 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#00B9FF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Release Notes
                </span>
              </div>

              <h1 style={{
                color: '#fff', fontSize: 26, fontWeight: 700,
                letterSpacing: '-0.02em', lineHeight: 1.2,
                fontFamily: 'Poppins, sans-serif', margin: 0,
              }}>
                What's changed
              </h1>
            </div>

            <button
              onClick={dismiss}
              aria-label="Close release notes"
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
        </div>

        {/* Release cards */}
        <div style={{
          padding: '24px 36px 28px',
          overflowY: 'auto',
          flex: 1, minHeight: 0,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: '#9CA3AF',
            margin: '0 0 14px', fontFamily: 'Poppins, sans-serif',
          }}>
            Recent updates
          </p>

          {RELEASES.length === 0 ? (
            <div style={{
              padding: '40px 16px',
              textAlign: 'center',
              border: '1.5px dashed #E5E7EB',
              borderRadius: 12,
              color: '#9CA3AF',
              fontFamily: 'Poppins, sans-serif',
            }}>
              <i className="fa-light fa-rectangle-history" style={{ fontSize: 28, opacity: 0.4, marginBottom: 12, display: 'block' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>
                No releases recorded yet
              </div>
              <div style={{ fontSize: 12 }}>
                Add the first entry to the <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>RELEASES</code> array in <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>ReleaseNotesModal.jsx</code> before the first prod deploy.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RELEASES.map((release, i) => (
                <div
                  key={release.date + release.title}
                  className="release-card"
                  style={{
                    '--card-color': release.accent,
                    padding: '16px 18px',
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    background: activeCard === i ? '#F9FAFB' : '#fff',
                    transition: 'all 180ms ease',
                    animation: `rnCardIn 400ms ${80 + i * 60}ms cubic-bezier(0.16,1,0.3,1) both`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={() => setActiveCard(i)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: 3, borderRadius: '3px 0 0 3px',
                    background: release.accent,
                    opacity: activeCard === i ? 1 : 0.6,
                    transition: 'opacity 180ms',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: `${release.accent}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={release.icon} style={{ color: release.accent, fontSize: 15 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 14, fontWeight: 600, color: '#1E2556',
                        fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em',
                      }}>
                        {release.title}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 500, color: '#9CA3AF',
                        fontFamily: 'Poppins, sans-serif', letterSpacing: '0.02em',
                      }}>
                        {formatDate(release.date)}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 10,
                    paddingLeft: 50,
                  }}>
                    {CATEGORY_ORDER
                      .filter(cat => release.categories[cat]?.length)
                      .map(cat => (
                        <div key={cat}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            marginBottom: 4,
                          }}>
                            <i className={CATEGORY_ICONS[cat]} style={{ color: '#9CA3AF', fontSize: 10 }} />
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              color: '#6B7280',
                              fontFamily: 'Poppins, sans-serif',
                            }}>
                              {cat}
                            </span>
                          </div>
                          <ul style={{
                            margin: 0, padding: 0, listStyle: 'none',
                            display: 'flex', flexDirection: 'column', gap: 3,
                          }}>
                            {release.categories[cat].map((item, j) => (
                              <li
                                key={j}
                                style={{
                                  fontSize: 12.5, color: '#6B7280',
                                  fontFamily: 'Poppins, sans-serif', lineHeight: 1.55,
                                  paddingLeft: 16, position: 'relative',
                                }}
                              >
                                <span style={{
                                  position: 'absolute', left: 4, top: 8,
                                  width: 4, height: 4, borderRadius: '50%',
                                  background: release.accent,
                                  opacity: 0.55,
                                }} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 36px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 11, color: '#9CA3AF',
            fontFamily: 'Poppins, sans-serif',
            flex: 1, minWidth: 0, lineHeight: 1.5,
          }}>
            Updates ship continuously while the dashboard is in beta.
          </span>
          <button
            onClick={dismiss}
            style={{
              background: '#1E2556', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '9px 22px', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              letterSpacing: '-0.01em',
              transition: 'background 140ms',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#2a3470'}
            onMouseLeave={e => e.currentTarget.style.background = '#1E2556'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
