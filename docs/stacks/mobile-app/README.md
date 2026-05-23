# Stack profile: mobile-app

For projects where mobile is the primary surface.  StoreSmart AI is the reference shape.

## Profile summary

**Shape**: React Native + Expo frontend, typically paired with Supabase for backend
**Default stack**: Expo (managed workflow) + TypeScript + Supabase (Postgres + Auth + Storage + pgvector) + OpenAI or other LLM via backend proxy
**Branch model**: dev/main with EAS Build profiles per environment
**Deployment**: EAS Build for native binaries, OTA updates via EAS Update for JS-only changes

## Docs in this profile

- `APP_KICKOFF.md` -- intake for setting up the mobile app shape
- `DEPLOYMENT.md` -- EAS Build, OTA updates, App Store / Play Store submission

## What the kickoff sets up

When you pick this profile, the kickoff asks:

1. Is this iOS-only, Android-only, or both?
2. Will the app have user accounts?  If yes, auth provider (usually Supabase Auth for this stack).
3. What features need a backend?  AI calls, payments, push notifications, file uploads.
4. Will there be a companion web app, or is mobile the only surface?

## What stays from the template

The `claude-core-template` app scaffold under `app/` is built for web (Vite+React), not mobile.  For this profile, **remove `app/` entirely** during kickoff and start with `npx create-expo-app@latest`.

The `exploration/` and `warehouse/` folders are NOT relevant and should be removed.

The CLAUDE.md, TODO.md, CHANGES.md, TEMPLATE_NOTES.md memory pattern stays as-is.

The `docs/stacks/mobile-app/` docs stay; the warehouse-analytics and web-app-saas docs can be removed or kept for reference.

## Patterns specific to this profile

**Backend proxy for AI calls.**  Never call OpenAI, Anthropic, or any LLM provider directly from the mobile client.  The API key would ship in the bundle and be extractable.  Always proxy through a backend function (Supabase Edge Functions, a Vercel serverless route, or a separate API).

**Auth tokens in `expo-secure-store`.**  Never put sensitive tokens in AsyncStorage without encryption.

**Safe areas.**  Wrap screens in `<SafeAreaView>` from `react-native-safe-area-context` so content doesn't render under the notch or home indicator.

**Performance basics.**  Lists must be virtualized (`FlatList` or `FlashList`).  Images via `expo-image` for caching.  Animations via `react-native-reanimated` v3 with worklets, not on the JS thread.

**Both platforms tested.**  iOS and Android behave differently for fonts, keyboard, safe areas, and modal presentation.  Don't ship without testing both.

## Reference projects

StoreSmart AI (QR-code-plus-AI home storage inventory).  Three-phase build plan.  React Native + Expo, Supabase + pgvector, OpenAI GPT-4o via backend proxy.

This profile is still under active development; patterns should feed back via the upstreaming loop.
