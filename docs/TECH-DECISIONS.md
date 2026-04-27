# Tech Decisions

Opinionated stack choices with the reasoning behind each. Where we considered alternatives, the tradeoffs are noted.

## TL;DR — The stack

| Layer | Choice |
|---|---|
| **Framework** | React Native + Expo (managed workflow) |
| **Language** | TypeScript (strict mode) |
| **Navigation** | Expo Router (file-based, like Next.js app router) |
| **State / data** | TanStack Query (server state) + Zustand (UI state) |
| **Networking** | Native `fetch` wrapped by a thin client; no Axios |
| **Auth** | Laravel Sanctum tokens; stored in `expo-secure-store` (Keychain / Keystore) |
| **Push notifications** | Expo Notifications → APNs (iOS) + FCM (Android) |
| **Crash & error reporting** | Sentry |
| **Analytics** | PostHog (self-hosted) — *or none in v1, decide before kickoff* |
| **CI/CD & build** | EAS Build + EAS Submit |
| **OTA updates** | EAS Update (gated by version compatibility) |
| **Testing** | Jest (unit) + Maestro (E2E flows) |
| **Linting / formatting** | ESLint + Prettier + Husky pre-commit |

## Why React Native + Expo

### What we considered

| Option | Verdict |
|---|---|
| **React Native + Expo** ✅ | Picked. Single codebase, fast iteration, OTA updates, mature ecosystem, TypeScript native. |
| Flutter | Strong second choice. Better animation perf and UI polish, but Dart is a smaller ecosystem and our backend / web is JS-friendly. |
| Native Swift + Kotlin | Best UX, 2× cost. Saves for v3 if the app gets big enough to justify rewriting hot paths. |
| Bare React Native (no Expo) | More config, more pain. Expo's managed workflow handles native plumbing we don't need to own. |
| Capacitor / Ionic | No. Not native enough for a fintech feel. |

### Why Expo specifically

- **One toolchain for build + submit.** EAS Build replaces fastlane plumbing. EAS Submit pushes to both stores from one CLI.
- **OTA updates.** Bug fix in JavaScript? Push it without a store review. Critical for fintech apps.
- **Native module ecosystem is fine now.** The "Expo can't do X" rule of 2019 is mostly dead. Camera, biometrics, secure store, push — all first-party.
- **Custom dev clients** if we ever need a native module not on Expo: `npx expo install --fix` and we ship.

## Project structure

```
scount_app/
├── app/                  # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── workspace-select.tsx
│   ├── (tabs)/
│   │   ├── dashboard.tsx
│   │   ├── invoices/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── expenses/
│   │   ├── customers/
│   │   └── more.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
├── src/
│   ├── api/              # Network client + endpoint hooks
│   ├── components/       # Shared components (Button, Card, etc.)
│   ├── theme/            # Colours, typography, spacing tokens
│   ├── hooks/            # Reusable hooks
│   ├── stores/           # Zustand stores
│   ├── lib/              # Utility helpers (formatters, validators)
│   └── types/            # TypeScript interfaces shared across the app
├── assets/               # Icons, fonts, images
├── docs/                 # This folder
├── app.config.ts         # Expo config (replaces app.json — TS gives us env interpolation)
├── eas.json              # EAS Build profiles (development, preview, production)
└── package.json
```

## Theming — match the web design

The mobile app inherits the same colour tokens as scount.my web. Codify them in `src/theme/colors.ts`:

```ts
export const moss = {
  50:  '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',  // primary
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
} as const;

export const ink = {
  900: '#04110A',
  800: '#061A0F',
  700: '#082316',
  600: '#0C2E1D',
} as const;
```

Light/dark themes mirror the web — light by default, dark toggle persists per user.

### Android — Material 3 dynamic colour

On Android 12+, the app **opts in to Material You dynamic colour**: the system extracts a tonal palette from the user's wallpaper and we feed it into surfaces, dividers, and secondary accents. The brand `moss-500` is reserved for elements that must stay scount.my-coloured regardless of OS theming:

- Brand mark (logo gradient)
- Primary CTAs (Sign in, Create invoice, etc.)
- Hero "Cash on hand" gradient card
- Status pulses (online, sync, success)
- Active tab indicator on the bottom tab bar

Implementation: install `react-native-material-you-colors` (or use Expo's built-in `expo-system-ui` for status bar, plus a thin theme provider that merges M3 tokens into our `theme/colors.ts`). On Android < 12 and on iOS, the dynamic-colour branch is bypassed and the brand palette is used end-to-end.

**Why not full M3 everywhere?** Because users opening a finance app expect to recognise it. The brand mark and primary actions stay scount.my green; the chrome adapts. Best of both.

## Authentication

- **Login:** email + password POST to `/api/v1/auth/login` → returns Sanctum token.
- **Storage:** token kept in `expo-secure-store` (iOS Keychain / Android Keystore — encrypted at rest).
- **Refresh:** Sanctum personal access tokens with 30-day expiry; refresh on 401.
- **Biometric unlock:** after first login, the user can opt into Face ID / Touch ID / Android biometric. Token stays in secure store; biometric just gates app access on cold start.
- **Logout:** delete token from secure store + revoke server-side via `/api/v1/auth/logout`.
- **No OAuth in v1.** Add Google / Apple Sign-In in Phase 2 if churn data justifies.

## Networking

A thin wrapper over `fetch` — no Axios, no SDK bloat:

```ts
// src/api/client.ts
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...init?.headers,
        },
    });
    if (!res.ok) throw await ApiError.from(res);
    return res.json();
}
```

Wrapped per-endpoint by **TanStack Query** hooks for caching, retries, and stale-while-revalidate behaviour.

## State management

- **Server data** — TanStack Query (no Redux). Cache invalidation by query key.
- **UI state** (open modals, theme preference, draft form values) — Zustand. Tiny, ergonomic, no boilerplate.
- **No global Redux.** Overkill for the app's complexity.

## Offline support (light)

Phase 1 only — ambitious offline is Phase 2.

- Read screens cache the last successful response in `AsyncStorage` keyed by query key. Show stale data with a "Last updated 4h ago" badge if the network is down.
- **Receipt photos** capture works offline: photo + form data go into a local SQLite queue (via `expo-sqlite`), retried on reconnect.
- Invoices are NOT created offline in v1 — too many side-effects (numbering, tax calc, ledger postings) to fake locally.

## Push notifications

- **Expo Notifications** library — handles APNs + FCM under one API.
- Server-side: Laravel emits via `expo-server-sdk-php` (or just calls Expo's HTTP API directly).
- Categories: invoice-paid, payment-received, weekly-digest, system. Each user can mute per category in-app.
- Deep links: tapping a notification opens the relevant detail screen via Expo Router.

## CI/CD

- **EAS Build** for iOS + Android binaries. Three profiles in `eas.json`:
  - `development` — dev client, simulator-friendly, internal-only
  - `preview` — TestFlight + Play Internal Testing
  - `production` — store builds
- **EAS Submit** for store uploads. Apple credentials via App Store Connect API key; Google via service account JSON.
- **GitHub Actions** triggers EAS builds on tag pushes (`v1.0.0` → production build).
- **OTA updates** for JS-only changes between binary releases.

## Versioning

- App version follows SemVer: `1.2.3`.
- Build number auto-increments via EAS.
- API version pinned per app version: app `1.x` talks to `/api/v1/*`. We never break v1; v2 ships when we add it.
- "App update required" forced upgrade path: `/api/v1/version-check` returns minimum supported version; older clients get a blocking screen with store deep link.

## What we are NOT using (and why)

| Tool | Why not |
|---|---|
| Redux / Redux Toolkit | TanStack Query + Zustand cover all our needs with less ceremony |
| Axios | `fetch` works, weighs less, and we don't need interceptor magic |
| Realm / WatermelonDB | Overkill for v1's offline scope; AsyncStorage + SQLite is enough |
| Firebase Auth | We have Laravel auth already; second source of truth = bugs |
| RevenueCat | Subscriptions managed in scount Laravel, not in-app for MY billing |
| Lottie | Tempting for animations; revisit if we need delight beyond CSS-equivalent transitions |
