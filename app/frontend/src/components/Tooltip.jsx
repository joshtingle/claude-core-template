import React, { useState, useRef, useLayoutEffect } from 'react'

// Shared tooltip used across the app. Matches the navy pill style
// (navy background, white text, soft shadow). Pass `content` as a string
// or JSX. Auto-flips to top when there's not enough room below.
export default function Tooltip({ content, children, placement = 'bottom', delay = 80, maxWidth = 320, block = false, wrapperStyle }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, side: placement })
  const wrapRef = useRef(null)
  const tipRef  = useRef(null)
  const showTimer = useRef(null)

  function show() {
    clearTimeout(showTimer.current)
    showTimer.current = setTimeout(() => setVisible(true), delay)
  }
  function hide() {
    clearTimeout(showTimer.current)
    setVisible(false)
  }

  useLayoutEffect(() => {
    if (!visible || !wrapRef.current || !tipRef.current) return
    const trig = wrapRef.current.getBoundingClientRect()
    const tip  = tipRef.current.getBoundingClientRect()
    const gap = 8
    let side = placement
    let top  = trig.bottom + gap
    if (placement === 'bottom' && (top + tip.height > window.innerHeight - 8)) {
      side = 'top'
      top  = trig.top - tip.height - gap
    } else if (placement === 'top') {
      top = trig.top - tip.height - gap
      if (top < 8) { side = 'bottom'; top = trig.bottom + gap }
    }
    let left = trig.left + trig.width / 2 - tip.width / 2
    left = Math.max(8, Math.min(left, window.innerWidth - tip.width - 8))
    setPos({ top, left, side })
  }, [visible, placement, content])

  if (!content) return children

  return (
    <>
      <span
        ref={wrapRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={{
          ...(block
            ? { display: 'block', position: 'relative', width: '100%' }
            : { display: 'inline-flex', position: 'relative' }),
          ...(wrapperStyle || {}),
        }}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={tipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            background: '#1E2556',
            color: '#fff',
            fontSize: 11,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            letterSpacing: '0.01em',
            lineHeight: 1.45,
            padding: '8px 11px',
            borderRadius: 6,
            maxWidth,
            pointerEvents: 'none',
            zIndex: 1100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.15)',
            opacity: 0,
            animation: 'iswTooltipIn 120ms ease forwards',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
          }}
        >
          {content}
        </div>
      )}
      <style>{`@keyframes iswTooltipIn { from { opacity: 0; transform: translateY(-2px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </>
  )
}
