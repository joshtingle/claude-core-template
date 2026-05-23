/**
 * Frontend Theme-Awareness Audit
 *
 * Scans frontend .jsx/.js files for hardcoded color values in inline style props
 * (background / color / border / borderColor with a literal #hex, rgb(), or rgba()).
 *
 * New UI elements must use theme CSS variables (var(--surface-card),
 * var(--text-primary), var(--border-light), etc.) so they adapt across themes.
 *
 * How it works
 *   - Walks app/frontend/src recursively for .jsx and .js files
 *   - Counts inline-style color literals per file
 *   - Compares to the BASELINE map below
 *   - Fails if a file in BASELINE has MORE violations than its baseline
 *   - Fails if a file NOT in BASELINE has ANY violations
 *
 * If you intentionally add a hardcoded color (e.g. a brand constant on the
 * always-navy nav bar where rgba(white, x) is intended), update BASELINE.
 * Prefer fixing the violation by switching to a CSS var.
 */

const fs   = require('fs');
const path = require('path');

const FRONTEND_SRC = path.resolve(__dirname, '../../frontend/src');

// Files allowed to keep their current violation counts. Numbers are the maximum
// number of hardcoded color literals tolerated; new violations must trend down,
// never up. The corporate navy nav bar at #1E2556 must never theme, and pill /
// dropdown / modal-header surfaces that sit ON that always-navy bar use
// rgba(white, x) by design -- those are the legitimate cases for hardcoded
// values. The WelcomeModal and ReleaseNotesModal are intentionally light
// overlays that match the brand's introduction surface.
const BASELINE = {
  'App.jsx':                              12,
  'components/layout/PageShell.jsx':       1,
  'components/ReleaseNotesModal.jsx':     30,  // light overlay matching the welcome modal aesthetic
  'components/ThemePicker.jsx':            3,
  'components/Tooltip.jsx':                4,
  'components/UnderConstruction.jsx':      7,
  'components/WelcomeModal.jsx':          38,  // baseline + 3 for the Release Notes button (color, border, hover bg)
};

// Matches: background: '#fff', color: "rgba(0,0,0,0.5)", border: '1px solid #abc'
// We do not match `var(--...)` references because those are themed.
const COLOR_LITERAL_RE =
  /(background|backgroundColor|color|border|borderColor|borderTop|borderBottom|borderLeft|borderRight|boxShadow):\s*['"][^'"]*?(#[0-9a-fA-F]{3,8}|rgb\(|rgba\()/g;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p, files);
    } else if (/\.(jsx|js)$/.test(entry.name)) {
      files.push(p);
    }
  }
  return files;
}

function countViolations(source) {
  const matches = source.match(COLOR_LITERAL_RE);
  return matches ? matches.length : 0;
}

describe('Frontend theme-awareness', () => {
  const files = walk(FRONTEND_SRC).sort();

  test('frontend src exists', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test('no new files introduce hardcoded color literals; baselined files do not grow', () => {
    const failures = [];
    for (const abs of files) {
      const rel = path.relative(FRONTEND_SRC, abs).replace(/\\/g, '/');
      const src = fs.readFileSync(abs, 'utf8');
      const count = countViolations(src);
      if (count === 0) continue;

      const allowed = BASELINE[rel];
      if (allowed === undefined) {
        failures.push(
          `  ${rel}: ${count} hardcoded color literal(s) in inline styles. ` +
          `Use var(--surface-card)/var(--text-primary)/var(--border-light) etc.`
        );
      } else if (count > allowed) {
        failures.push(
          `  ${rel}: ${count} hardcoded color literals (baseline ${allowed}). ` +
          `Replace new ones with CSS theme variables.`
        );
      }
    }
    if (failures.length) {
      throw new Error(
        'Theme-awareness regressions detected:\n' + failures.join('\n') +
        '\n\nFix by using CSS theme vars (see app/frontend/src/styles/themes.css), ' +
        'or update BASELINE in app/backend/tests/frontend-theme.test.js if the new ' +
        'literal is intentional (e.g. lives on the always-navy nav bar).'
      );
    }
  });
});
