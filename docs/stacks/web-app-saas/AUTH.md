# Authentication (web-app-saas)

Auth is the area where shortcuts hurt the most.  Pick a provider, follow their docs, don't get clever.

## Pick a provider

The defaults that work:

**Auth0** -- mature, multi-provider, polished hosted UI.  Best when you want it to "just work".  Pricier above the free tier.  Use the `@auth0/auth0-react` SDK for Vite/React frontends, or Auth0's Next.js SDK.

**Supabase Auth** -- bundled with Supabase Postgres.  Free up to generous limits.  Simple JWT-based flow.  Best when you're already using Supabase for the database.  Use `@supabase/supabase-js` on the client.

**NextAuth (Auth.js)** -- self-hosted, free, configurable.  Best for Next.js apps where you want to control the auth layer without a third-party dependency.

**Microsoft Identity (`Microsoft.Identity.Web`)** -- when integrating with an Azure AD tenant or building B2B apps with Microsoft customers.

**Custom (DIY)** -- only if there's a specific reason like compliance requirements.  Rolling your own auth is the single most common source of project-killing security bugs.

## Patterns that apply across providers

JWT tokens for stateless auth.  The frontend stores the token (in HttpOnly cookies if possible, in memory or sessionStorage otherwise).  The backend validates the token's signature on every request.

Refresh tokens for sessions longer than the access token's lifetime.  Access tokens should live 15-60 minutes, refresh tokens 7-30 days.

Roles and permissions in the JWT claims, OR in a `user_roles` table the backend reads on every request.  The first is faster; the second is easier to change without re-issuing tokens.  Pick one and stick with it.

CORS configured to the exact origins that should be allowed.  Don't use `*` in production.

CSRF protection: if your auth uses cookies, you need CSRF tokens or `SameSite=Strict` cookies.  If your auth is purely Bearer-token in `Authorization` headers, CSRF is moot.

## What the auth setup must produce

For the frontend:

- A `useAuth()` hook (or equivalent) that returns the current user, login/logout functions, and a loading state.
- Route guards: components or middleware that redirect unauthenticated users to the login page.
- Token refresh logic that runs silently and re-issues access tokens before they expire.

For the backend:

- Middleware that extracts the JWT, validates it, and attaches the user to the request context.
- A way to check roles/permissions per route or per resource.
- An endpoint to fetch the current user (`/api/me` or similar).

## Things to never do

Don't store passwords in your own database unless you absolutely must.  Use the auth provider's password storage.

Don't generate JWTs yourself with a hand-rolled secret.  Use the provider's SDK.

Don't expose service-role keys or admin tokens to the client.  Anything client-side is public.

Don't trust client-claimed roles.  Always re-verify on the backend.  A user can edit their JWT claims; they cannot forge the signature, but they can lie about what they THINK is in there.

Don't disable CSRF protection because it's annoying.  It's annoying because it's important.

Don't put auth bypass flags in env vars ("DISABLE_AUTH=true for dev").  This will get committed and end up in production within 6 months.  Use a properly-scoped test user for dev instead.
