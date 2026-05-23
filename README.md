# claude-core-template

A starter repository for building software projects with consistent Claude.ai and Claude Code guard rails.  Evolves with use: every project that clones it can feed improvements back in.

## What this is

Cloning this repo gives you a project skeleton already wired with:

- A `CLAUDE.md` that both Claude.ai (web/app) and Claude Code read at session start, with clearly delineated posture sections for each surface.
- A structured kickoff conversation Claude runs automatically on the first session, capturing the project's identity, stack profile, data scope, and brand decisions.
- File-based project memory (`TODO.md`, `CHANGES.md`, `DATA_INVENTORY.md`, `HANDOFF.md`) that keeps state consistent across surfaces and sessions.
- Stack-profile docs for the four kinds of projects this template covers: warehouse analytics, web SaaS, mobile, and local tooling.
- Database backend docs (Snowflake, SQL Server on Azure, SQL Server on AWS RDS, Postgres/Supabase, SQLite) with connection patterns and conventions.
- An optional pre-wired Vite+React+Express+SQLite app scaffold for warehouse-analytics projects.
- Exploration and warehouse templates (concept, inventory, proposal, validation) for data work.
- GitHub Actions workflows for the dev/main branching model with test, deploy, and snapshot jobs.
- An upstreaming loop that lets every project feed generic improvements back into this template.

## The methodology in one paragraph

You start a project by cloning this template.  On the first Claude session, Claude detects that the template hasn't been kicked off yet and walks you through structured intake before doing real work.  The intake captures stack profile, data scope, deployment target, and brand decisions, then updates `CLAUDE.md` so all future sessions have proper context.  As the project develops, `TODO.md` tracks work, `CHANGES.md` logs inflection points, and `HANDOFF.md` carries POCs from Claude.ai to Claude Code when execution work begins.  When you discover patterns worth keeping, you record them in `TEMPLATE_NOTES.md` as upstream candidates, and periodically promote them into this template repo so future projects benefit.

## How to use this template

Clone or copy this repo as the starting point for a new project.  Rename the top-level folder to your project name.  Run `bootstrap.ps1` (Windows) or follow the manual setup in `docs/SETUP.md` for other platforms.

Open the project in either Claude.ai or Claude Code.  Claude reads `CLAUDE.md` automatically and detects that this is a fresh template; it will run the kickoff conversation before any other work.

Copy the contents of `CLAUDE.md` into your Claude.ai project instructions panel so the web interface uses the same rules.  Both surfaces share the same file but apply different postures (claude.ai = thinking partner, Claude Code = builder).

## The four stack profiles

Each profile has its own folder under `docs/stacks/` with the patterns specific to that kind of project.  The kickoff conversation picks one based on your answers.

**warehouse-analytics** -- a dashboard or analytical app built on a SQL warehouse.  Methodology: discovery, concept-by-concept exploration, mart design, thin app on top.  Default stack: Snowflake + Node/Express + Vite/React + SQLite cache + Azure App Service.  This is the most mature profile in the template.

**web-app-saas** -- a public-facing web app with persistent users, authentication, and a database.  Default stack varies (Postgres or SQL Server backend, Node/Express or .NET API, React frontend, AWS or Azure deployment).

**mobile-app** -- a React Native + Expo mobile app, typically paired with Supabase for backend.  Optional companion web app.

**local-tooling** -- desktop tools, scripts, automations.  PowerShell, AutoHotkey, Excel plugins, CLI utilities.  No deployment pipeline; the repo is both source and artifact.

When you start a project that doesn't fit any of these cleanly, pick the closest profile and document the deviations during kickoff.  When a deviation pattern repeats, that's a signal to add a new stack profile (via the upstreaming loop).

## The upstreaming loop

The point of this template is that it improves.  See `docs/UPSTREAMING.md` for the workflow.  Short version: when you discover something in an active project that should be generic, you record it in that project's `TEMPLATE_NOTES.md` as an upstream candidate.  When you next visit this template repo, you walk through candidate upstream changes from active projects, generalize them, merge them in, and tag a new template version.

## Template version

See `TEMPLATE_VERSION` for the current version.  Projects record which version they cloned from in their own `TEMPLATE_NOTES.md` so the upstreaming loop knows what's already been merged.

## What this template intentionally does NOT do

It does not contain working business code.  The app scaffold under `app/` is a starting frame, not a finished application.

It does not enforce a specific cloud provider.  Patterns for Azure and AWS are both documented; the kickoff picks one based on the project's needs.

It does not generate code.  It establishes conventions so that when Claude generates code, the generated code is consistent across your projects.

## Maintenance

When you complete a project using this template and discover patterns worth promoting, follow `docs/UPSTREAMING.md` to feed them back here.  The template improves with each project that uses it.
