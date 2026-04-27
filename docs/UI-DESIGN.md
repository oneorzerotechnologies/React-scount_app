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

## Screen 01 — Splash

### Purpose
Pure brand moment held during cold start while the app reads the stored token, validates it, and decides where to route. **No CTAs, no decisions.** This is the equivalent of the iOS launch screen on a real device — except ours is themed and animated.

### Layout
- Top safe area + status bar
- Vertical centre: brand pill (80pt) → wordmark `scount.my` → tagline "Run the books, anywhere."
- Bottom: a three-dot pulse loader (10pt above the home indicator)

No buttons. No links. No footnotes.

### States
| State | What happens |
|---|---|
| First launch (no token) | Hold for 5s (brand moment) → push to **02 Login** |
| Returning, valid token, single workspace | Hold for 5s → push to **04 Dashboard** |
| Returning, valid token, multiple workspaces | Hold for 5s → push to **03 Workspace** |
| Returning, expired token | Hold for 5s → push to **02 Login**, prefill last email if available |
| Network error during token check | Hold for 5s → push to **02 Login** with offline banner |

**Note on the 5-second hold:** longer than the typical 1–2s splash. Intentional — gives the brand mark time to land and lets us run any background checks (auth refresh, version compatibility) without making the user wait an additional spinner screen. If the token check finishes early, we still wait out the 5 seconds; if it's still in flight at 5s, we push anyway and continue resolving in the background.

### Copy
- Tagline: **Run the books, anywhere.**

That's it. The screen has no other copy.

### Interactions
- None. The screen is non-interactive by design — taps are a no-op until the token check completes.

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
- *Forgot password* → in-app browser to `https://scount.my/forgot-password`
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
  - **Last-used workspace** is wrapped in a `border-2 border-moss-400` ring as a visual hint — but selection is always an explicit tap.
- Bottom: dashed "+ Create new workspace" button

### States
| State | UI |
|---|---|
| Single workspace | This screen never renders — user lands on dashboard |
| 2–5 workspaces | List, no search input |
| 6+ workspaces | Search input appears at top |
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
**v1 mobile is scoped to quotations and invoices only.** The dashboard answers two questions in one glance: *what am I owed?* and *what should I act on next?* Plus two quick actions for the only verbs the app supports — create a quote, create an invoice.

### Layout

**Header bar (sticky at top of scroll, 56pt):**
- Workspace switcher chip (left) — shows current workspace, taps to swap
- Bell icon with green dot if unread notifications (right)
- Avatar circle (right-most) — taps to "More" tab

**Below the header (scrollable):**
1. Greeting block: "Good morning, Eva" *(am/pm aware)*
2. **Hero card — "You're owed"** — green gradient, total outstanding (sum of unpaid invoices), sub-line: "8 unpaid invoices · 3 due this week"
3. **Two-up cards (action items)** — these are deliberately the things needing follow-up, not vanity metrics:
   - **Open quotes** — count + total pipeline value (e.g. "12 · RM 84.2k pipeline"). White card.
   - **Overdue** — count + total amount (e.g. "3 · RM 18.4k · chase up"). Amber-tinted card to draw attention.
4. **Collected · 30d** chart card — sparkline of payments received over the last 30 days, with total at top right
5. **Two quick-action buttons** (full-width pair):
   - **New quote** — outlined moss style
   - **New invoice** — solid moss-500 (primary, glowy)
6. **Recent activity** — compact list of last ~5 events, mixing quotes and invoices. Each row shows a status pill (`PAID` green, `SENT` amber, `QUOTE` sky-blue, `OVERDUE` red), the document number, the counterparty, and the amount.

**Tab bar (sticky at bottom, 78pt incl. safe area):**
- **Home / Quotation / Invoice / Contacts / More**
- Active tab uses `moss-700` (light) / `moss-300` (dark); inactive `slate-400`
- Quotation and Invoice each get a first-class tab — they're the entire product surface in v1.
- **Contacts** is the umbrella label for the parties directory. Inside the tab, a segmented control at the top toggles between **Clients** (people you bill) and **Suppliers** (people you owe). One tab, both sides of the ledger.
- Everything else (Reports, Expenses, Bills, Reconciliation, Fixed Assets, Settings) is parked behind **More** until v2.

### Why these specific cards

| Card | Why it's there |
|---|---|
| Hero "You're owed" | The single number a small-business owner opens the app to check. Bigger and bolder than anything else. |
| Open quotes | Quotes that haven't converted are revenue leaking. Pipeline value gives context, not just a count. |
| Overdue (amber) | The other side of the same coin — money you should already have. Amber treatment is intentional cognitive nag. |
| Collected 30d | Visual proof the business is moving — and the only chart on the screen. Everything else is a number. |
| New quote / New invoice | The two verbs the app does. No third action; we don't want to dilute focus. |
| Recent activity | Confirms recent actions worked + lets the user jump back into a doc with one tap. |

### What's intentionally NOT here

- No expense capture, no customer-list KPI, no inventory, no cash-on-hand-across-accounts. Those are out of scope for v1 mobile.
- No goal-tracking, no AI recommendations, no streaks. Fintech for SMEs, not a habit-tracker.
- No charts beyond the single sparkline. Phone screens get cluttered fast.

### States
| State | What user sees |
|---|---|
| Loading (cold start) | Skeleton placeholders for hero + 2-up + chart + activity rows |
| Empty (brand new workspace) | Hero shows `RM 0` with sub "No invoices yet"; 2-up zeroed; recent activity replaced by an onboarding card: "Create your first quote" |
| Stale (offline + last cache) | Soft banner top of scroll: "Last updated 2h ago" with refresh action |
| Pull to refresh | Native iOS / Android refresh control re-fetches `/v1/dashboard` |
| Loaded with data | As shown in mockup |
| Error | Toast at bottom + cached data shown if available |

### Copy
- Greeting: **Good morning · afternoon · evening, {firstName}**
- Hero label: **You're owed**
- 2-up labels: **Open quotes** (count + pipeline value) · **Overdue** (count + amount, "chase up")
- Chart label: **Collected · 30d** with total at top right
- Quick actions: **New quote** · **New invoice**
- Section heading: **Recent**
- Activity row format: `[STATUS pill] QT-038 · CityWorks · RM 8.7k`

### Interactions
- Tap workspace chip → bottom sheet listing other workspaces (no full screen jump)
- Tap bell → push to "Notifications" full-screen list
- Tap avatar → switch to More tab
- Tap "You're owed" hero → push to Invoice list filtered to `status=overdue,sent`
- Tap "Open quotes" card → push to Quotation list filtered to `status=open`
- Tap "Overdue" card → push to Invoice list filtered to `status=overdue`
- Tap **New quote** → modal stack with the quote create form
- Tap **New invoice** → modal stack with the invoice create form
- Tap an activity row → push to that document's detail screen
- Tap "See all" → push to Quotation or Invoice tab depending on the most recent activity kind
- Pull to refresh → re-fetch `/v1/dashboard`

## Screen 05 — Quotation workflow

The full quote-to-cash arc lives in three screens reachable from the **Quotation** tab.

### 05A — Quotation list

**Purpose:** scan all quotes by status. Default filter is `Open` (the action-needed bucket).

**Layout**
- Sticky header: title "Quotations" + "+ New" CTA top-right (icon-only, primary moss)
- Sticky segmented filter pills: **All · Open · Accepted · Declined · Expired** (horizontal scroll on small phones)
- Search input below the pills (filters by ref, contact name, amount)
- Scrollable list of quote rows. Each row:
  - Status pill (left) — `OPEN` neutral, `ACCEPTED` moss-green, `DECLINED` red, `EXPIRED` slate
  - Quote ref (`QT-038`) in mono, small
  - Contact name (medium weight)
  - Amount (right, bold)
  - Sub-line: "Issued 2 Apr · Expires 2 May" (smaller, slate)

**States**
| State | UI |
|---|---|
| Loading | Skeleton rows |
| Empty (no quotes for this filter) | Centered illustration + "No open quotes. Create one." with a primary CTA |
| Pull to refresh | Native control re-hits `/v1/quotations?status=…` |
| Tap row | Push to **05B detail** |
| Tap "+ New" | Push to **05C create** |

### 05B — Quotation detail

**Purpose:** view a single quote, take action on it (accept, decline, convert, share).

**Layout**
- Header: back button + ref `QT-038` + overflow menu (•••) for archive / duplicate
- Big status badge below header (one of `OPEN / ACCEPTED / DECLINED / EXPIRED / CONVERTED`)
- Contact card: avatar + name + tap to push to contact detail
- Amount summary card: subtotal · tax · **total** (large)
- Line items list (read-only): description × qty @ unit price = amount
- Notes block (if any)
- Dates row: Issued · Expires · Updated
- Sticky action bar at the bottom (above safe area):
  - If status = `OPEN`: **Accept** · **Decline** · **Share** (overflow: convert)
  - If status = `ACCEPTED`: **Convert to invoice** (primary, glowy) · **Share**
  - If status = `CONVERTED`: card showing "Converted to INV-00510" with tap-to-open
  - If status = `DECLINED` or `EXPIRED`: only **Share** + overflow

**States**
| State | UI |
|---|---|
| Loading | Skeleton hero + line-item placeholders |
| Action loading (e.g. converting) | Sticky bar disabled with spinner; on success replace with success toast + new linked-invoice card |
| Action error | Inline error in the action bar, retry available |
| Network offline | Detail still shown from cache; action buttons disabled with "Offline — try again later" tooltip |

### 05C — Quotation create

**Purpose:** make a new quote in 5 fields or fewer.

**Layout (modal stack pushed from "+ New" or dashboard quick action)**
- Header: cancel (×) left · "New quote" title · save right (disabled until valid)
- **Field 1** — Contact picker (required): tap opens contact bottom sheet (clients only by default, can switch to suppliers); at the bottom of the sheet is "+ New contact"
- **Field 2** — Issue date (defaults to today)
- **Field 3** — Expires date (defaults to issue + 30 days)
- **Field 4** — Line items (required, at least one):
  - Description · Qty · Unit price · Tax code · Amount (calculated)
  - "Add line" link below
- **Field 5** — Notes (optional, multiline)
- Total card sticky at the bottom of scroll: subtotal + tax + total

**States**
| State | UI |
|---|---|
| Empty form | Save disabled |
| Valid form | Save enabled (primary moss) |
| Submitting | Save shows inline spinner, fields locked |
| Validation error | Inline red text under offending field |
| Save success | Push to **05B detail** of the new quote |

## Screen 06 — Invoice workflow

Mirrors the quotation flow with status-specific differences. Three screens.

### 06A — Invoice list

Same layout as **05A** with these differences:
- Filter pills: **All · Draft · Sent · Paid · Overdue**
- Status pill colours: `DRAFT` slate · `SENT` amber · `PAID` moss-green · `OVERDUE` red
- Sub-line on each row: "Issued 2 Apr · Due 2 May" (or "Overdue 4 days" in red when overdue)

### 06B — Invoice detail

Same as **05B** with these differences:
- Big status badge: `DRAFT / SENT / PARTIALLY PAID / PAID / OVERDUE`
- Below the amount summary, an additional **Payments** block listing recorded payments (date · method · amount) — read-only on mobile, marked with a "Web only" badge. Recording, voiding, and manually marking-paid all live on `scount.my`.
- When the invoice is part of a recurring schedule, an **Upcoming cycles** card renders next, listing the next three issue dates + amounts (read from `recurrence.upcoming_cycles` on the detail response). One-off invoices omit the card. Cadence/anchor day/end-date are configured on web only.
- Action bar at the bottom — single action for all states except `DRAFT`. Reminder-sending and payment-recording are both web-only on v1.
  - If `DRAFT`: **Send** · **Edit** · **Delete**
  - If `SENT` / `OVERDUE` / `PAID`: **Share** (full-width). Edit lives on the pencil in the header; reminders + refunds are on web.
  - If linked to a quote: a small "From QT-038 →" pill at the top, taps back to the quote
  - If recurring: a small "Recurring · monthly" pill next to the lineage pill

### 06C — Invoice create

Same as **05C** with:
- Title: "New invoice"
- "Issue date" + "Due date" replaces "Issue date" + "Expires"
- "Save as draft" link in the header overflow (so people can keep adding line items without committing)

When invoice create is triggered via **Convert quote → invoice**, the form is pre-filled from the quote and the user only needs to confirm the due date before saving.

## Screen 07 — Contacts workflow

### 07A — Contacts list

**Purpose:** the unified parties directory.

**Layout**
- Sticky header: title "Contacts" + "+ New" CTA top-right
- Segmented control: **Clients · Suppliers** (full width, just below the header). Selection persists per session.
- Search input below the segmented control
- Scrollable list of contact rows. Each row:
  - Avatar circle (initial on a pastel gradient unique per contact)
  - Name (bold) + sub-line ("3 invoices · RM 12k outstanding" for Clients, "Last bill 2 weeks ago" for Suppliers — Phase 2)
  - Chevron right

**States**
| State | UI |
|---|---|
| Loading | Skeleton rows |
| Empty (no contacts in segment) | Empty state: "No clients yet. Add one to start invoicing." with primary CTA |
| Tap row | Push to **07B detail** |
| Tap "+ New" | Push to **07C create** |

### 07B — Contact detail

**Purpose:** see a single contact and what they have outstanding.

**Layout**
- Header: back button + name + overflow (••• for edit, archive)
- Big avatar + name + type pill (`CLIENT` moss / `SUPPLIER` slate)
- Contact-info card: email · phone · address (each tappable — copies to clipboard)
- Activity summary card:
  - For Clients: total outstanding · open quotes · last invoice
  - For Suppliers: last bill · total billed YTD (Phase 2 only — show empty state in v1)
- Recent activity list: last ~10 quotes/invoices (Clients) or empty card (Suppliers in v1)
- Action bar (sticky at bottom):
  - Clients: **New quote** · **New invoice**
  - Suppliers: empty in v1; **New bill** in Phase 2

### 07C — Contact create

**Purpose:** add a new client or supplier in under a minute.

**Layout (modal stack)**
- Header: cancel (×) · "New contact" · save (disabled until valid)
- Type segmented control at the top: **Client · Supplier** (defaults to whatever segment was active when "+ New" was tapped)
- Required fields: Name, Email
- Optional fields: Phone, Tax ID, Address (collapsed under "Add address" link)
- Notes (multiline)

**States**
| State | UI |
|---|---|
| Empty | Save disabled |
| Valid | Save enabled |
| Submitting | Spinner |
| Save success | Pop modal; if user came from a quote/invoice form, return them to that form with the new contact pre-selected |

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

| # | Question | Decision |
|---|---|---|
| 1 | Sign in with Apple / Google in v1? | **No.** Email + password only. Revisit in Phase 2 once we see drop-off data on the login screen. |
| 2 | Dashboard hero card? | **Cash on hand.** Stays as currently mocked. |
| 3 | Android theming? | **Material 3 dynamic colour** on Android 12+ (system tonal palette drives surfaces & secondary accents). Brand `moss-500` is reserved for the brand mark, primary CTAs, and the hero "Cash on hand" gradient — those never change. iOS stays fully branded. |
| 4 | Workspace screen — auto-advance? | **No.** Selection is always an explicit tap. Last-used workspace is highlighted as a visual hint only. |
| 5 | Landing screen CTAs? | **None.** Screen 01 is a pure splash / brand moment. Held **5 seconds** while we validate the stored token, then auto-routes to login or workspace/dashboard. |
| 6 | Bottom tab bar? | **Home · Quotation · Invoice · Contacts · More.** The Contacts tab is the unified parties directory with a segmented toggle inside (Clients / Suppliers). Expenses + Bills + Reports + Fixed Assets + Reconciliation all live behind More. |

## Stack confirmation

**React Native + Expo (managed workflow)** is locked in. Full rationale and supporting choices in [`TECH-DECISIONS.md`](TECH-DECISIONS.md).
