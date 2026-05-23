import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ThemePicker from './components/ThemePicker.jsx'
import WelcomeModal from './components/WelcomeModal.jsx'
import { api } from './utils/api.js'
import { PageShell } from './components/layout/PageShell.jsx'

// Define your nav items here. Each entry: { to, icon (FA classes), label }.
// The first entry's `to` value is used as the default redirect from `/`.
const NAV_ITEMS = [
  { to: '__DEFAULT_ROUTE__', icon: 'fa-light fa-house', label: 'Home' },
]

function Sidebar({ collapsed, setCollapsed, onShowWelcome }) {
  const [refresh, setRefresh] = useState(null)

  useEffect(() => {
    api.admin.dataCurrency()
      .then(r => setRefresh(r?.snapshot_completed_at || r?.load_date || null))
      .catch(() => {})
  }, [])

  // Format the snapshot timestamp (UTC ISO) in the user's local timezone.
  // Drops ":00" when the time lands on an exact hour.
  const refreshLabel = (() => {
    if (!refresh) return null
    const d = new Date(refresh)
    if (isNaN(d.getTime())) return String(refresh)
    const datePart = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
    let timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      .toLowerCase().replace(/\s+/g, '')
    timePart = timePart.replace(':00', '')
    return `${datePart} ${timePart}`
  })()

  return (
    <aside style={{
      width: collapsed ? 60 : 216,
      background: 'var(--surface-nav)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden', flexShrink: 0,
      position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100,
    }}>
      <div style={{
        padding: collapsed ? '0' : '0 18px',
        height: 56,
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--isw-green) 0%, var(--isw-emerald) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(49,171,70,0.4)',
        }}>
          <i className="fa-solid fa-chart-simple" style={{ color: '#fff', fontSize: 14, lineHeight: 1, display: 'block' }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em', lineHeight: 1.2 }}>__PROJECT_NAME__</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.02em' }}>insightsoftware</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            padding: collapsed ? '9px 0' : '9px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, textDecoration: 'none',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
            transition: 'all 120ms ease',
            fontSize: 13, fontWeight: isActive ? 500 : 400,
            letterSpacing: '-0.01em',
            position: 'relative',
          })}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 3px 3px 0',
                    background: 'var(--isw-green)',
                  }} />
                )}
                <span style={{ width: 18, textAlign: 'center', flexShrink: 0, display: 'inline-flex', justifyContent: 'center' }}>
                  <i className={item.icon} style={{ fontSize: 14, opacity: isActive ? 1 : 0.7 }} />
                </span>
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--isw-green)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>
            {refreshLabel ? `Last Refresh . ${refreshLabel}` : 'Connecting...'}
          </span>
        </div>
      )}

      <button onClick={onShowWelcome} style={{
        background: 'transparent', border: 'none',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.3)', padding: collapsed ? '11px 0' : '11px 16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 8,
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: 'color 120ms', width: '100%',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        title="About this dashboard"
      >
        <span style={{ width: 18, textAlign: 'center', flexShrink: 0, display: 'inline-flex', justifyContent: 'center' }}>
          <i className="fa-light fa-circle-info" style={{ fontSize: 13 }} />
        </span>
        {!collapsed && <span style={{ fontSize: 12 }}>About</span>}
      </button>

      <button onClick={() => setCollapsed(!collapsed)} style={{
        background: 'transparent', border: 'none',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.3)', padding: collapsed ? '11px 0' : '11px 16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-end',
        transition: 'color 120ms',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
      >
        <span><i className={`fa-light ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} style={{ fontSize: 11 }} /></span>
      </button>
    </aside>
  )
}

function TopBar() {
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, left: 0, height: 56,
      background: 'var(--surface-nav)',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '0 24px', gap: 10, zIndex: 99,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <ThemePicker />
    </div>
  )
}

// Placeholder landing page. Replace with real project pages and add Routes below.
function HomePage() {
  return (
    <PageShell title="__PROJECT_NAME__" subtitle="Scaffolding is ready. Edit src/App.jsx to add real pages.">
      <div className="card" style={{ padding: 24 }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          This is the placeholder landing page. The theme switcher (top right), sidebar, and welcome modal
          are wired up. See <code>docs/APP_KICKOFF.md</code> for what to swap in next.
        </p>
      </div>
    </PageShell>
  )
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const sidebarWidth = collapsed ? 64 : 220

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <WelcomeModal open={showWelcome} onOpen={() => setShowWelcome(true)} onClose={() => setShowWelcome(false)} />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} onShowWelcome={() => setShowWelcome(true)} />
      <TopBar />
      <main style={{
        flex: 1,
        minWidth: 0,
        marginLeft: sidebarWidth,
        marginTop: 56,
        padding: '22px 28px 56px',
        transition: 'margin-left 200ms ease',
        minHeight: 'calc(100vh - 52px)',
        display: 'flex', flexDirection: 'column',
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="__DEFAULT_ROUTE__" replace />} />
          <Route path="__DEFAULT_ROUTE__" element={<HomePage />} />
          {/* Add project routes here */}
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </BrowserRouter>
  )
}
