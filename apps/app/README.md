# View app

Expo (React Native) client — one codebase for **iOS, Android and Web**. The web
build is also what the Tauri desktop shell wraps.

## Run

```bash
cp .env.example .env        # EXPO_PUBLIC_API_URL=http://localhost:4000/api
npm run start               # dev server — press w / i / a
```

The app only ever talks to the View API. It has no knowledge of content sources.

## Screens

| Route | |
| --- | --- |
| `app/(auth)/login`, `register` | first screen; split hero on wide viewports |
| `app/(tabs)/index` | Home — hero carousel, rails, personalised "You Might Like" |
| `app/(tabs)/browse` | catalogue with category / sort / genre filters, infinite scroll |
| `app/(tabs)/search` | debounced unified search |
| `app/(tabs)/profile` | identity, preferred categories, derived genres, match‑reminder toggle, favorites, history, sign out |
| `app/item/[id]` | full metadata, description, **Watch** (opens the hidden source link), favorite, star rating, "More like this" |
| `app/category/[slug]` | deep‑linkable category page |

## State

Redux Toolkit + RTK Query (`src/store/`). The base query attaches the access
token from the store, and on a `401` refreshes once (single‑flight mutex) and
replays the request; a failed refresh clears the session. Tokens are persisted
with `expo-secure-store` on native and `localStorage` on web
(`src/lib/storage.ts`).

## Match notifications

`src/features/matchNotifications.ts` schedules a **local** notification 15 min
before each upcoming match (native only; opt‑out on the Profile screen). No push
server, nothing leaves the device.

## Build

### Web

```bash
npm run export:web          # -> dist/  (static; needs an SPA fallback to index.html)
```

### Android

With EAS (recommended):

```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview      # APK
eas build -p android --profile production   # AAB for Play Store
```

Locally:

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease      # app/build/outputs/apk/release/
```

Set `EXPO_PUBLIC_API_URL` to your deployed API before building.

### iOS

With EAS:

```bash
eas build -p ios --profile production        # .ipa (needs an Apple account)
```

Locally (macOS + Xcode):

```bash
npx expo prebuild -p ios
open ios/View.xcworkspace                     # Archive from Xcode
```

## Typecheck

```bash
npm run typecheck
```
