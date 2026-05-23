# Project Kickoff

Run on the first session of a freshly-cloned template.  The goal is to fill in `CLAUDE.md` and supporting files with project-specific context so all future sessions are properly grounded.

If you (Claude) are reading this at the start of a fresh project session, run this intake before any other work.  If the user is impatient and wants to jump straight to building, gently push back -- 20 minutes of intake saves hours of misaligned work.

Don't fire these questions as a checklist.  Adapt the order based on what the user offers up first.  If the user volunteers an answer early, capture it and move on.  The goal is structured context, not interrogation.

## Round 1: What is this project?

What's the project name (folder-safe slug is fine)?

In one sentence, what is this project supposed to do?

Who is the audience or stakeholder?  Personal use, work team, public users, paying customers, etc.

What phase are we in: POC (just exploring), Build (committed to shipping), or Production (already live)?

What does "done" look like?  A dashboard, a public app, an internal tool, a one-time analysis, a script library?

What's the timeline?  This affects whether to aim for a small validated MVP fast or to do thorough exploration.

## Round 2: Stack profile

This is the most important question because it determines which other docs apply.  Pick the closest match:

**warehouse-analytics** -- a dashboard or analytical app built on a SQL warehouse.  The data is the input; the app is the output.  Methodology centers on validating business concepts against raw data before designing marts and an app on top.  Reference: `docs/stacks/warehouse-analytics/`.

**web-app-saas** -- a public-facing or internal web app with users, authentication, persistent state, and a database.  Reference: `docs/stacks/web-app-saas/`.

**mobile-app** -- a React Native + Expo mobile app, typically paired with a serverless backend like Supabase.  Reference: `docs/stacks/mobile-app/`.

**local-tooling** -- desktop tools, scripts, automations.  PowerShell, AutoHotkey, Excel plugins, CLI utilities.  No deployment pipeline.  Reference: `docs/stacks/local-tooling/`.

If the project doesn't fit any of these cleanly, pick the closest and document the deviations in `TEMPLATE_NOTES.md`.  When a deviation pattern repeats across projects, it becomes a candidate for a new stack profile in the template.

## Round 3: Database backend (skip if local-tooling and no DB)

What database backend does this project use?  Snowflake, SQL Server (Azure), SQL Server (AWS RDS), PostgreSQL (Supabase or self-hosted), SQLite, or none?

For each backend there's a `docs/databases/<backend>.md` with connection patterns and conventions.  Confirm which one applies and read it.

What's the connection method?  SSO, key-pair, service account, connection string in env var.

What schemas, databases, or tables are in scope?  Default to read-only.

Are there schemas or tables that look relevant but should be explicitly out of scope?  Why?

## Round 4: Deployment target (skip if local-tooling)

Where is this project going to run when it's deployed?

- Azure App Service (the well-trodden path for warehouse-analytics)
- AWS EC2 + RDS (personal projects, more control)
- Vercel (Next.js or serverless web apps)
- Expo EAS Build (mobile)
- Local-only (no deployment)
- Other

The default `.github/workflows/` ship with patterns for the most common targets.  The kickoff confirms which apply and which can be removed.

## Round 5: Brand and styling

Do you have a color palette to apply?  If yes, capture the hex codes and the role mapping for primary, secondary, neutrals, and state colors.

Typography preference?  Default to system fonts if not specified.

Will this project have multiple themes or dark mode?  (Determines whether the theme-awareness rule activates.)

## Round 6: Git and deployment specifics

Is the GitHub repo created yet?  If yes, what's the URL?  If no, will we create one now?

Should we scaffold the default dev/main CI/CD pattern, or does this project need something different?

Are there secrets that need to be configured in the deployment target?  List them -- DO NOT paste actual secret values into the conversation.  See `docs/SECURITY.md` for credential handling.

## Round 7: Existing context (skip for greenfield)

Is there existing code I should read before starting?  Where?

Is there a previous CLAUDE.md, design doc, or POC that informs this?

Are there agreed definitions or "headline numbers" I should record in `CLAUDE.md`?

## After the intake

When all answers are in (or marked deferred):

1. Update `CLAUDE.md` "Project identity" section with name, purpose, stakeholders, phase, stack profile, template version, and update date.

2. Update `CLAUDE.md` "Authorized data scope" section with the database backend and the in-scope / out-of-scope lists.

3. Update `CLAUDE.md` "Brand and styling" section if a palette was provided.

4. Update `TEMPLATE_NOTES.md` "Template version at clone" with the version from the `TEMPLATE_VERSION` file.

5. Read the stack profile docs at `docs/stacks/<profile>/` to internalize the stack-specific methodology.

6. If using a database backend, read `docs/databases/<backend>.md` for connection patterns.

7. Add a CHANGES.md entry: `YYYY-MM-DD: Project kickoff completed.  Stack: <profile>.  Database: <backend>.  Initial scope: <brief summary>`.

8. Populate the initial `TODO.md` with the first few items based on what the user described.

9. If the stack profile is warehouse-analytics or web-app-saas, the app scaffold under `app/` is relevant -- check whether `docs/stacks/<profile>/APP_KICKOFF.md` should be run next.  If the profile is mobile-app, the app scaffold doesn't apply and should be removed.  If the profile is local-tooling, the `app/`, `exploration/`, and `warehouse/` folders are all irrelevant and can be removed.

10. Commit the kickoff results: `chore: project kickoff complete, CLAUDE.md populated`.

Only after these steps complete should you proceed to substantive project work.

## When intake reveals problems

If during intake you discover blockers, name them clearly and don't proceed:

If warehouse access isn't set up yet (for warehouse-analytics), stop and direct the user to the relevant database doc.  Don't try to work around it.

If there's no validation reference for any concept and no stakeholder available to confirm numbers (for warehouse-analytics), raise the risk explicitly.  Exploration without validation produces hypotheses, not findings.

If the requested scope is ambiguous (multiple databases, unclear which schemas, "we want to explore the whole data lake"), push back.  Scope tightly to begin with.  Expanding scope later is easy; recovering from unscoped exploration is hard.

If the timeline is unrealistic for the scope, say so.  A real dashboard with validated numbers takes weeks at minimum.  Setting expectations early prevents disappointment.

If the user can't articulate what "done" looks like, stop and figure that out before doing anything else.  Projects without a definition of done absorb infinite work.
