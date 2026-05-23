# Deployment (mobile-app)

## EAS Build (native binaries)

Builds are configured in `eas.json` at the project root.  Three profiles at minimum:

**development**: dev client with debugging, installable on registered test devices.  Used during active development.

**preview**: internal distribution build, shareable via QR code or TestFlight/Play Console internal track.  Used for stakeholder review before public release.

**production**: signed for App Store / Play Store submission.

Trigger a build: `eas build --profile preview --platform ios` (or `android`, or `all`).

Build duration: 15-30 minutes typical.  Builds run on Expo's infrastructure; no need for a Mac for iOS builds.

## EAS Submit (store submission)

Once a production build is ready, submit to the stores:

`eas submit --profile production --platform ios`
`eas submit --profile production --platform android`

Requires:

- Apple Developer account ($99/year) for iOS.
- Google Play Developer account ($25 one-time) for Android.
- App listings created in App Store Connect and Play Console with metadata.
- Privacy policy URL (required by both stores).

## EAS Update (OTA)

For JavaScript-only changes (no native module updates, no app icon changes, no permission additions), push an Over-The-Air update instead of a new native build:

`eas update --branch preview --message "Fix typo in welcome screen"`
`eas update --branch production --message "Performance improvement on home screen"`

The channels (`preview`, `production`) match the EAS Build profiles via `eas.json` configuration.

OTA can update: JS code, JSON configuration, images, fonts.

OTA cannot update: native modules, app icon, splash screen, permission strings.  Changes to those require a new native build.

## Release strategy

Recommended flow:

1. Work on the `dev` branch.  Push OTA updates to the `preview` channel for testing.
2. When a milestone is ready for stakeholder review, build a new preview binary and distribute via TestFlight (iOS) or Play Console internal testing (Android).
3. When ready for public release, merge `dev` to `main`, build a production binary, submit to stores.
4. Between native releases, push OTA updates to the `production` channel for any JS-only fixes.

## Things to never do

Don't put secrets in `expo-constants` or any other client-readable config.  They ship in the bundle.

Don't use `Alert.alert` for anything beyond developer debug messages.  Build proper modals.

Don't ship without testing on both iOS and Android.  Behaviors differ.

Don't change the bundle identifier after the first store submission.  It's permanent; changing it creates a new app entry and orphans all existing users.

Don't enable OTA updates for changes that should require a new native build.  This produces "the app crashes after update" reports that are very hard to debug.

Don't ship a production build without going through the privacy policy + App Tracking Transparency (iOS) prompts.  Both stores reject apps that handle user data without them.
