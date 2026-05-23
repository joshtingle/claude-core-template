import React from 'react'

// Semitransparent overlay shown on pages still in development. Wraps the
// content pane (offset by the fixed sidebar/topbar) so navigation remains
// clickable. Listens to the main element's inline marginLeft so it tracks
// sidebar collapse/expand without jitter.
export default function UnderConstruction({ pageName }) {
  const [sidebarWidth, setSidebarWidth] = React.useState(220)

  React.useEffect(() => {
    function updateWidth() {
      const main = document.querySelector('main')
      if (main) {
        const ml = parseFloat(main.style.marginLeft) || 0
        setSidebarWidth(ml)
      }
    }
    updateWidth()
    const observer = new MutationObserver(updateWidth)
    const main = document.querySelector('main')
    if (main) observer.observe(main, { attributes: true, attributeFilter: ['style'] })
    window.addEventListener('resize', updateWidth)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 56,
      left: sidebarWidth,
      right: 0,
      bottom: 0,
      background: 'rgba(248, 250, 252, 0.55)',
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
      transition: 'left 220ms cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        background: 'var(--surface-card, #ffffff)',
        borderRadius: 16,
        padding: '48px 64px',
        boxShadow: '0 24px 48px rgba(30, 37, 86, 0.12)',
        border: '1px solid var(--border-light, #e2e8f0)',
        textAlign: 'center',
        maxWidth: 480,
      }}>
        <div style={{
          fontSize: 72,
          color: '#DFAC2D',
          marginBottom: 16,
          lineHeight: 1,
        }}>
          <i className="fa-light fa-helmet-safety" />
        </div>
        <h2 style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#1E2556',
          margin: '0 0 12px 0',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {pageName} Under Construction
        </h2>
        <p style={{
          fontSize: 14,
          color: 'var(--text-muted, #64748b)',
          margin: 0,
          lineHeight: 1.6,
          fontFamily: 'Poppins, sans-serif',
        }}>
          This page is still in development and will be available in a future release.
        </p>
      </div>
    </div>
  )
}
