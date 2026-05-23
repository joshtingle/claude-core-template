# Stack profile: web-app-saas

For public-facing or internal web apps with persistent users, authentication, and a database.  Examples: the civic transparency app concept, the friend's venture, dashboards with multi-user access.

## Profile summary

**Shape**: real backend + real frontend + real users
**Default stack options**:
- Backend: Node/Express OR .NET 8 (project chooses)
- Frontend: Vite/React OR Next.js (project chooses)
- Database: Postgres (Supabase or RDS) OR SQL Server (Azure SQL or AWS RDS)
- Deployment: Azure App Service OR AWS EC2+RDS OR Vercel (project chooses)
- Auth: Auth0, Supabase Auth, NextAuth, or Microsoft Identity (project chooses)
**Branch model**: dev/main with auto-deploy on push to main

## Docs in this profile

- `APP_KICKOFF.md` -- intake for setting up the app shape
- `DEPLOYMENT.md` -- deployment patterns for the common targets
- `AUTH.md` -- authentication patterns

## What the kickoff sets up

When you pick this profile, the kickoff asks:

1. Backend language: Node or .NET?
2. Frontend framework: Vite/React or Next.js?
3. Database: which backend?
4. Deployment target: Azure, AWS, or Vercel?
5. Auth method: which provider?
6. Are there existing users to migrate, or starting fresh?

The combination of answers determines which sections of the app scaffold survive and which get swapped.

## What stays from the template

The `app/` scaffold's frontend layout primitives (PageShell, theme system) and the dev/main workflow pattern transfer cleanly.

The hybrid SQLite cache pattern from warehouse-analytics does NOT transfer.  Web SaaS apps typically query the database directly per request, with connection pooling.

The `exploration/` and `warehouse/` folders are NOT relevant and should be removed during kickoff.

## Reference projects

This profile is less mature than warehouse-analytics in the template -- it's been outlined but not battle-tested against a finished project yet.  The civic transparency app and the friend's venture are the early reference points; their patterns should feed back into this profile via the upstreaming loop.
