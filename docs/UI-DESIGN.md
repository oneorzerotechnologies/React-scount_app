# UI Design — First-Run Flow

Visual mockups: open [`mockups/preview.html`](../mockups/preview.html) in a browser. This doc is the written spec — flow, layout decisions, states, copy, and interactions.

## Flow at a glance

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │    │              │
│   01         │    │   02         │    │   03         │    │   04         │
│  Landing     │ ─▶ │  Login       │ ─▶ │  Workspace   │ ─▶ │  Dashboard   │
│              │    │              │    │  (skip if 1) │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                       │                    │                    ▲
                       │ "Forgot password"  │ "Sign out"         │
                       └────────────────────┴────────────────────┘
                              deep-links to web reset
```

**Skip rules:**
- If a returning user has a valid token in secure store → skip 01 & 02, go straight to 03 (or 04 if single workspace).
- If user belongs to **exactly one** workspace → skip 03, go straight to 04.
- If session-token rejected (401) → drop user back to 02, prefill last-known email.

## Shared visual rules

These apply to every screen in the app, not just these four.

| Rule | Spec |
|---|---|
| **Colour primary** | `moss-500` `#10B981` |
| **Surface (light)** | `#FFFFFF` cards on `#F1F5F4` page |
| **Surface (dark)** | `ink-800` cards on `ink-900` page |
| **Text primary** | `slate-900` light / `moss-100` dark |
| **Text secondary** | `slate-600` light / `moss-100/70` dark |
| **Border** | `slate-200` light / `moss-900/40` dark |
| **Typography** | Inter — 700 for headings, 600 for buttons & key numbers, 400 body |
| **Corner radius** | 16px cards, 20px primary buttons, 12px inputs |
| **Tap targets** | ≥ 44 × 44 pt everywhere |
| **Safe area** | Respect notch top + home indicator bottom |
| **Transitions** | 250ms ease for theme + push transitions; native push for navigation |
| **Android theming** | Material 3 dynamic colour on Android 12+ — system tonal palette drives surfaces, dividers, and secondary accents. Brand `moss-500` stays for the brand mark, primary CTAs, the cash-on-hand hero gradient, and status pulses. iOS stays fully branded. |

## Screen 01 — Landing

### Purpose
The first thing users see on cold start (first install, or signed-out state). Its only job is to direct them to one of two paths: **sign in** or **create account**.

### Layout
- Top safe area + status bar
- Vertical centre: brand pill (64pt) → wordmark `scount.my` → tagline "Run the books, anywhere."
- Bottom 30%: two stacked CTAs
  - **Sign in** (primary, filled `moss-500`)
  - **Create an account** (secondary, outlined)
- Footer: "By continuing you agree to Terms & Privacy" (10pt, links open in-app web view)

### States
| State | What happens |
|---|---|
| First launch | Animation: brand pill fades + slides up over 0.6s |
| Returning, valid token | Skipped entirely — user goes straight to dashboard |
| Returning, expired token | Shown briefly, then auto-route to login |

### Copy
- Tagline: **Run the books, anywhere.**
- Primary CTA: **Sign in**
- Secondary CTA: **Create an account**
- Footer microcopy: **By continuing you agree to our Terms & Privacy.**

### Interactions
- Tap *Sign in* → push to **02 Login**
- Tap *Create an account* → in-app browser to `https://scount.my/register` (Phase 1 — native sign-up form is Phase 2)
- Tap *Terms* / *Privacy* → in-app browser to scount.my pages

## Screen 02 — Login

### Purpose
Authenticate the user with email + password. After first success, store a Sanctum token and offer biometric unlock for next time.

### Layout
- Status bar + back button (top-left)
- Brand pill (40pt) — smaller than landing
- H1: **Welcome back** · Sub: **Sign in to your scount.my workspace.**
- Form
  - **Email** input — autocomplete `username`, keyboard `email-address`, no autocapitalize
  - **Password** input — secure entry by default, eye toggle to reveal
  - "Forgot password?" right-aligned link below password
- **Sign in** primary CTA
- "Use Face ID" secondary CTA *(visible only after first successful sign-in on this device)*
- Bottom: "New to scount.my? **Create an account**"

### States
| State | UI behaviour |
|---|---|
| Empty form | CTA disabled, secondary state |
| Filling | CTA enables when email parses + password ≥ 8 chars |
| Submitting | CTA shows inline spinner, fields disabled |
| Server validation error (422) | Inline red text under offending field |
| Wrong credentials (401) | Inline error below password: "Email or password is incorrect" |
| Network error | Toast at top: "Couldn't reach server. Try again." |
| Biometric available | Face ID button shown; tapping it unlocks via Keychain-stored token (no password needed) |

### Copy
- Title: **Welcome back**
- Sub: **Sign in to your scount.my workspace.**
- Forgot link: **Forgot password?**
- Primary CTA: **Sign in**
- Biometric CTA (iOS): **Use Face ID** *(or "Touch ID" / "Use biometrics" depending on device)*
- Footer: **New to scount.my? Create an account**

### Interactions
- Submit success → POST `/v1/auth/login` returns token → store in Keychain → push to **03 Workspace** (or **04 Dashboard** if user has only one workspace)
- *Forgot password* → in-app browser to `https://app.scount.my/forgot-password`
- *Create an account* → in-app browser to `https://scount.my/register`
- Back arrow → return to **01 Landing**

## Screen 03 — Workspace selection

### Purpose
For users who belong to multiple workspaces (multi-business owners, accountants servicing several clients), pick which one to open. **Skipped entirely if the user has exactly one workspace.**

### Layout
- Status bar
- Header row: greeting "Hi, Eva" / title "Choose a workspace" + sign-out icon top-right
- Subtext: "You're a member of N workspaces."
- Search input (only visible when N > 5)
- Scrollable list of workspace cards. Each card:
  - 36pt rounded square with first letter on a brand-coloured gradient
  - Workspace name (truncated to 1 line)
  - Role badge: `Owner` (filled green) / `Admin` (outlined) / `Member` (outlined)
  - "Last used 2h ago" timestamp
  - Chevron right
  - **Last-used workspace** is wrapped in a `border-2 border-moss-400` ring **and shows a 3-second countdown bar across the bottom of the card** (full → empty over 3s)
- Auto-advance helper line below the highlighted card: **"Opening in 3s · Tap to stay"**
- Bottom: dashed "+ Create new workspace" button

### Auto-advance behaviour

When this screen first renders, a 3-second countdown begins for the last-used workspace.

| Trigger | Effect |
|---|---|
| 3 seconds elapse with no input | POST `/v1/workspaces/{id}/select` for the last-used workspace, navigate to **04 Dashboard** |
| Tap the highlighted (last-used) card | Cancel countdown, treat as explicit selection (same navigation, but no further wait) |
| Tap a different card | Cancel countdown, select that workspace instead |
| Tap anywhere else on the screen (search bar, scroll area) | Cancel countdown, leave UI in "manual select" mode (countdown does not restart) |
| User scrolls before timeout | Cancel countdown |
| Network error during auto-select | Surface inline error on the card; user can tap to retry |

**Why a countdown bar, not a spinner?** Predictability — users see exactly how long they have, and the bar reads as "active by default" rather than "loading". The microcopy "Tap to stay" makes the cancel affordance unambiguous.

### States
| State | UI |
|---|---|
| Single workspace | This screen never renders — user lands on dashboard |
| 2–5 workspaces | List, no search input |
| 6+ workspaces | Search input appears at top |
| First render (multi-workspace) | Countdown starts on the last-used card |
| Countdown cancelled | Bar fades out, "Tap to stay" microcopy disappears, all cards now require explicit tap |
| Tapping a card | Card flashes moss-50 background, chevron fades to spinner, navigation to dashboard begins |
| Tapping "Create new workspace" | In-app browser to `https://scount.my/register/workspace` |

### Copy
- Title: **Choose a workspace**
- Subtitle: **You're a member of {n} workspaces.**
- Last-used badge (visual, no text)
- Empty state (zero workspaces — shouldn't happen post-onboarding): **You don't have a workspace yet. Create one to start.**

### Interactions
- Tap card → POST `/v1/workspaces/{id}/select` → on success, push to **04 Dashboard**
- Sign-out icon → revoke token, return to **01 Landing**

## Screen 04 — Dashboard (Home tab)

### Purpose
The "what's my business doing right now" answer in one glance. Plus the three actions worth the trip to the phone.

### Layout

**Header bar (sticky at top of scroll, 56pt):**
- Workspace switcher chip (left) — shows current workspace, taps to swap
- Bell icon with green dot if unread notifications (right)
- Avatar circle (right-most) — taps to "More" tab

**Below the header (scrollable):**
1. Greeting block: "Good morning, Eva" *(am/pm aware — "Good evening" after 6pm)*
2. Hero card: **Cash on hand** — green gradient, large number, "3 accounts · ▲ 8.2% this month"
3. Two-up KPI cards: **Revenue MTD**, **Outstanding** (with invoice count)
4. Cash flow chart card: 30-day sparkline + total delta
5. Three quick-action buttons: **+ Invoice**, **+ Expense**, **+ Customer**
6. Recent activity heading + "See all" link
7. Last 5 transaction rows (compact)

**Tab bar (sticky at bottom, 78pt incl. safe area):**
- Home / Invoices / Expenses / Contacts / More
- Active tab uses `moss-700` (light) / `moss-300` (dark); inactive `slate-400`

### States
| State | What user sees |
|---|---|
| Loading (cold start) | Skeleton placeholders for hero card + KPIs + activity rows |
| Empty (brand new workspace) | Hero shows `RM 0`, KPIs zeroed, recent activity replaced by an onboarding card: "Create your first invoice" |
| Stale (offline + last cache) | Soft banner top of scroll: "Last updated 2h ago" with refresh action |
| Pull to refresh | Native iOS / Android refresh control re-fetches `/v1/dashboard` |
| Loaded with data | As shown in mockup |
| Error | Toast at bottom + cached data shown if available |

### Copy
- Greeting: **Good morning · afternoon · evening, {firstName}**
- Hero label: **Cash on hand**
- KPI labels: **Revenue MTD** · **Outstanding** · _(tertiary on next scroll: **Bills due**)_
- Cash flow card: **Cash flow · 30d**
- Quick actions: **Invoice** · **Expense** · **Customer**
- Section heading: **Recent**
- Transaction format: `INV-482 · PT Anugerah · +RM 12.4k`

### Interactions
- Tap workspace chip → bottom sheet listing other workspaces (no full screen jump)
- Tap bell → push to "Notifications" full-screen list
- Tap avatar → switch to More tab
- Tap hero card → push to "Cash" detail (Phase 2 — currently no-op)
- Tap any KPI card → filtered list ("Revenue MTD" → invoices filtered to this month)
- Tap a quick action → modal stack with the relevant create form
- Tap "See all" → push to Invoices tab
- Pull to refresh → re-fetch dashboard

## Animations & micro-interactions

| Where | Effect | Duration |
|---|---|---|
| Brand pill on landing | Fade + slide up | 600ms |
| KPI cards on dashboard load | Stagger fade up | 100ms each |
| Sparkline | Path draw on first paint | 800ms |
| Tab change | Native iOS / Android push | system default |
| Pull to refresh | Spinner + bounce | system default |
| Theme toggle | Background + text color tween | 250ms |
| Tap feedback | Native ripple (Android) / tap highlight (iOS) | system default |
| Successful payment recorded | Haptic notification (success) | — |

## Accessibility

| Concern | Plan |
|---|---|
| Dynamic type | Use system text-size scales; cap headlines at 1.3× |
| Colour contrast | All text ≥ 4.5:1 on its surface in both themes |
| VoiceOver / TalkBack | Every actionable element labelled; KPI cards announce as "Cash on hand, RM 312,540, 8.2% increase" |
| Reduced motion | Skip the brand pill animation, fade only |
| RTL | Full RTL support reserved for Phase 3 (BM/EN don't need it) |

## Locked decisions

These were the open questions in the first review pass. Answers below are final for v1.

| # | Question | Decision |
|---|---|---|
| 1 | Sign in with Apple / Google in v1? | **No.** Email + password only. Revisit in Phase 2 once we see drop-off data on the login screen. |
| 2 | Dashboard hero card? | **Cash on hand.** Stays as currently mocked. |
| 3 | Android theming? | **Material 3 dynamic colour** on Android 12+ (system tonal palette drives surfaces & secondary accents). Brand `moss-500` is reserved for the brand mark, primary CTAs, and the hero "Cash on hand" gradient — those never change. iOS stays fully branded. |
| 4 | Workspace screen — auto-advance? | **Auto-advance to last-used workspace after 3 seconds.** Cancellable by tapping anywhere on the screen or by tapping a different workspace. See updated Screen 03 spec for the countdown UI. |

## Stack confirmation

**React Native + Expo (managed workflow)** is locked in. Full rationale and supporting choices in [`TECH-DECISIONS.md`](TECH-DECISIONS.md).
