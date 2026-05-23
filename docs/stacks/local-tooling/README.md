# Stack profile: local-tooling

For desktop tools, scripts, automations, and anything that runs on a personal machine without a hosted deployment.

## Profile summary

**Shape**: scripts or local utilities, no server, no deployment pipeline
**Default stacks**:
- PowerShell scripts (Windows automation)
- AutoHotkey v2 (Windows UI automation)
- Node.js CLI utilities
- Python scripts (data munging, analysis)
- Excel + EVE Online plugin formulas (a niche but real category for Joshua's projects)
**Branch model**: dev/main with optional tagged releases for distributable scripts

## Docs in this profile

- `APP_KICKOFF.md` -- minimal intake, since these projects have less ceremony
- `DISTRIBUTION.md` -- when and how to distribute local tools to others

## What "local-tooling" means

There is no deployment.  The "release" is whatever's on the dev machine.  The repo is the source of truth and the artifact at the same time.

This profile exists mostly to record conventions for these projects rather than to add machinery.  The `claude-core-template` overhead (kickoff, file-based memory, etc.) is still useful for keeping Claude oriented across sessions, but most of the warehouse-analytics and web-app-saas patterns don't apply.

## What stays from the template

`CLAUDE.md`, `TODO.md`, `CHANGES.md`, `TEMPLATE_NOTES.md` -- yes, even small tools benefit from cross-session memory.

`docs/PROJECT_KICKOFF.md`, `docs/SESSION_WORKFLOW.md`, `docs/SECURITY.md` -- yes.

`docs/HANDOFF.md.template` -- yes; even local tools sometimes graduate from Claude.ai sketches to Claude Code execution.

The `app/` folder -- no, remove during kickoff.

The `exploration/` and `warehouse/` folders -- no, remove during kickoff.

The default GitHub Actions workflows -- replace with a minimal one if the tool needs CI (linting, smoke tests), otherwise remove.

## Typical project shapes

- **PowerShell automation**: scripts in `scripts/` with `.ps1` extension, optional `.psm1` modules.  Run via Task Scheduler or by double-click.
- **AutoHotkey v2 utilities**: `.ahk` files at the repo root or in `scripts/`.  Compile with Ahk2Exe for portable distribution.
- **Excel/EVE plugins**: workbook + supporting `.txt` or `.js` files.  Workbook itself usually lives outside the repo (in OneDrive or local), the repo holds the formulas, queries, and documentation.
- **Local CLIs**: Node or Python scripts in `bin/`.  Wired up via npm `bin` or a Python entry point so they're callable from any directory.

## Patterns specific to this profile

**Document the runtime environment at the top of CLAUDE.md.**  Windows 11 + PowerShell 7 + AutoHotkey v2.  Or Ubuntu on WSL2 with Node 22.  Or whatever it actually is.  Without this, six months from now you'll come back to a script and wonder why it doesn't work on the new machine.

**Use `$PSScriptRoot` (PowerShell), `__dirname` (Node), or equivalent.**  Don't assume the current working directory.  Scripts called by Task Scheduler start in `C:\Windows\System32` and will surprise you.

**`.env.local` for credentials, gitignored.**  Scripts load it explicitly.  For PowerShell, `Get-Credential` and Windows Credential Manager are often cleaner than `.env.local` since they integrate with the OS.

**Pester for PowerShell tests.  Jest or Vitest for Node.**  Tests aren't required for true one-shot scripts, but anything run more than monthly should have at least a smoke test.

## Reference projects

Joshua's PowerShell + AutoHotkey v2 automation suite for Windows (RDP session management, etc.).

EVE Online Excel plugins with MAP-over-CHARACTER_BLUEPRINTS formulas.

Graytin Financial LLC's ATM lead generation pipeline (OpenClaw-based, SQL schema `atm_leads`).
