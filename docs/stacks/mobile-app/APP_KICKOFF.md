# App Kickoff (mobile-app)

Run when starting a mobile project from this profile.

## Intake questions

### Identity

Project slug (kebab-case)?  Used in `app.json` and the bundle identifier.

Human-readable name?  Shows on the device home screen and app stores.

What's the one-sentence purpose statement?  Who are the users?

Bundle identifier convention: `com.<yourname>.<projectslug>` (e.g. `com.joshtingle.storesmart`).  This must be stable from day one -- changing it later means a new app in the stores.

### Platforms

iOS, Android, or both?  Almost always both, unless there's a specific reason.

iOS minimum version: Expo's current default (typically iOS 15.1+).  Going lower means dropping Expo SDK features.

Android minimum SDK: Expo's current default (typically API 24+, Android 7+).

### Auth

Will the app have user accounts?

If yes, what auth method?

- **Supabase Auth** -- default for this stack.  Email/password, magic link, social providers.
- **Apple Sign-In** -- required by App Store if you offer any other social sign-in option.
- **Anonymous** -- when no real accounts are needed (one-off tools, calculators).

### Backend pairing

Almost every mobile app needs a backend.  Default for this stack: **Supabase**.

What features need backend support?

- Auth (see above)
- Postgres database for app data
- Storage for user-uploaded files (images, documents)
- Realtime for collaborative features
- Edge Functions for AI calls, scheduled jobs, custom server logic

If the app needs LLM features (AI search, suggestions, summaries):

- Which provider?  OpenAI, Anthropic, Google.
- Calls go through an Edge Function (or other backend), NEVER directly from the client.
- Rate limiting per user happens at the backend, not the client.

### Updates and distribution

OTA channels: at minimum `preview` and `production`.  Configured in `eas.json`.

Will distribution be public (App Store + Play Store) or internal (TestFlight + Play Console internal testing)?

For the first build, internal distribution is the default -- get the app on a device, iterate quickly via OTA, submit to stores when stable.

### Companion web app

Is there a companion web app, or is mobile-only?  If mobile-only, skip the rest.

If there's a companion web, is it sharing backend code with the mobile app (turborepo, single Supabase instance), or completely separate?

## After intake

1. Update `CLAUDE.md` "Project identity" with the choices.

2. Remove the template's `app/` folder (it's web-scaffolded, not mobile).  Run `npx create-expo-app@latest <project-slug> --template` to scaffold the mobile app.  Use the TypeScript template.

3. Remove `exploration/` and `warehouse/` folders -- not applicable.

4. If using Supabase, create the project at supabase.com and capture the URL + anon key into `.env.local` (gitignored).  The service role key goes only in Edge Function environment, not in the mobile bundle.

5. Set up EAS in the project: `npm install -g eas-cli`, `eas login`, `eas build:configure`.

6. Read `docs/stacks/mobile-app/DEPLOYMENT.md` for the build and release flow.

7. Add `CHANGES.md` entry capturing the choices.

8. Populate initial `TODO.md` with the first few feature increments.

## What this kickoff does NOT do

It does not create the App Store / Play Store listings.  Those need real screenshots, descriptions, privacy policy URL, etc.  Defer until the app is close to submission.

It does not write any business logic or features.  Those start after kickoff.

It does not pick a state management library or styling approach.  Defaults: React Context + TanStack Query for state; StyleSheet API for styling.  Add NativeWind or Zustand only when the project's complexity demands it.
