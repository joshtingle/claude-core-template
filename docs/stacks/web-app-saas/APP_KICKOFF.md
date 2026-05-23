# App Kickoff (web-app-saas)

Run when starting a project from this profile.  The web-app-saas profile is more flexible than warehouse-analytics, so kickoff is broader.

## Intake questions

### Identity

Project slug (kebab-case)?

Human-readable name?

What's the one-sentence purpose statement?  Who are the users?  Is this public or internal?

### Authentication

Will the app have users with accounts?  If no, skip the rest of this section.

If yes, what auth provider?

- **Auth0** -- mature, multi-provider, pricier at scale
- **Supabase Auth** -- bundled with Supabase Postgres, simple
- **NextAuth (Auth.js)** -- Next.js-friendly, self-hosted
- **Microsoft Identity** -- when integrating with Microsoft tenant or B2B
- **Custom** -- only if there's a specific reason

What identity providers do users sign in with?  Email/password, Google, Microsoft, etc.

Will users have roles or permissions?  If yes, what are they?

### Backend

Backend language: Node/Express or .NET 8?

- **Node/Express** -- faster setup, JS shared with frontend, smaller team friendly
- **.NET 8** -- when integrating with Microsoft ecosystem, when team prefers C#, when type safety end-to-end matters

API style: REST or GraphQL?  Default to REST unless GraphQL is clearly the right call (heavy nested data, multiple client types).

### Database

See `docs/databases/` for the available backend modules.  Most common choices for this profile:

- **Postgres on Supabase** -- when you want auth + database + storage bundled
- **Postgres on AWS RDS** -- when you want more control and AWS-native
- **SQL Server on Azure SQL** -- when integrating with Microsoft ecosystem
- **SQL Server on AWS RDS** -- when the org standardized on SQL Server but lives in AWS

Will the app need a search index?  If yes, Postgres full-text search is often enough; only reach for Elasticsearch/Algolia when the requirements clearly exceed it.

Will the app handle file uploads?  If yes, S3 (AWS) or Azure Blob Storage (Azure) for the actual files; the database stores only references.

### Frontend

Frontend framework:

- **Vite + React** -- when the app is a SPA with a separate API
- **Next.js** -- when SEO matters, when SSR/ISR is useful, when colocating frontend and serverless backend

If Vite + React, the `app/frontend/` scaffold from the template applies with minor changes.

If Next.js, scrap the scaffold's frontend folder and start with `npx create-next-app@latest`.

### Deployment target

- **Azure App Service** -- Linux + Node startup pattern from warehouse-analytics works here too.  Add Auth via App Service Authentication if simple, or via in-app auth library if complex.
- **AWS EC2 + RDS** -- when you want full control.  See `docs/stacks/web-app-saas/DEPLOYMENT.md`.
- **Vercel** -- when using Next.js and the backend fits in serverless functions.

### Pricing model (if applicable)

If this is a SaaS with paying customers:

What's the pricing model?  Free + paid tiers, usage-based, per-seat?

Payment provider: Stripe is the default; only deviate with reason.

Will there be a billing portal, self-service plan changes, dunning emails?  Stripe Customer Portal handles the basics; build only what Stripe doesn't.

## After intake

1. Update `CLAUDE.md` "Project identity" with the choices.

2. If using a different frontend than the scaffold (Next.js), remove `app/frontend/` and scaffold the alternative.

3. If using a different backend than the scaffold (.NET), remove `app/backend/` and scaffold the alternative.

4. Remove `exploration/` and `warehouse/` folders -- not applicable to this profile.

5. Read `docs/databases/<chosen_backend>.md` and `docs/stacks/web-app-saas/DEPLOYMENT.md`.

6. Add `CHANGES.md` entry capturing the choices.

7. Populate initial `TODO.md` with the first few items.

## What this kickoff does NOT do

It does not write any business logic.  The first feature you build is up to the project.

It does not configure the auth provider end-to-end.  The provider's own docs do that.  Your job is to know which provider you picked and stick to it.

It does not pick a CSS framework.  Tailwind, vanilla CSS, CSS Modules, Styled Components -- pick what fits your team and the project's complexity.  Don't add a CSS framework "in case".
