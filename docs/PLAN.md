# Master Plan — scount.my Mobile App

## 1. Goal

Ship a **native iOS + Android app** for scount.my that gives small-business owners a **fast, focused mobile surface** for the things they actually need on a phone: capture, glance, get notified.

The mobile app is **not a port of the web app**. The web app stays primary for end-of-month close, complex bookkeeping, multi-line journals, and heavy reporting. The mobile app does fewer things, and does them in two taps.

## 2. Target users

- **Solo founders & freelancers** — on the move, capturing receipts, sending invoices from their phone.
- **SME owners** — checking cash position between meetings, approving payments, getting paged when an invoice is paid.
- **Cashiers (POS)** — *Phase 2* — ringing up sales on a tablet at the counter.

Not targeted in v1: accountants doing books, finance teams running close.

## 3. Design principles

1. **Capture beats entry.** Snap a receipt, type a quick line, done. The app fills the rest from defaults.
2. **Read in seconds, write in 30.** Every screen answers a question; every form has ≤ 5 fields.
3. **Same ledger, anywhere.** Whatever happens in the app shows up in the web in real time, and vice versa. Zero duplicate-data dance.
4. **Offline-tolerant for the moments that matter.** Receipt capture and POS sales must work with no signal — they queue and sync when back online.
5. **One brand.** Same green, same typography, same voice as scount.my web. Light by default, dark mode supported.

## 4. MVP scope (Phase 1 → Phase 3)

### Must-have for v1.0 launch

| Surface | Detail |
|---|---|
| **Auth** | Email/password login, biometric unlock (Face ID / Touch ID / Android biometric), workspace switcher for multi-business users |
| **Dashboard** | KPIs (revenue MTD, outstanding, cash on hand), 30-day cash-flow sparkline, last 5 transactions |
| **Invoices** | List, filter (paid / sent / overdue), detail view, **create invoice in ≤ 5 fields**, send via email/share |
| **Expenses** | Quick capture: photo → amount → category → vendor → save. OCR auto-fill is Phase 2. |
| **Customers & Vendors** | Searchable list, detail card with statement/aging snapshot, "new" form |
| **Notifications** | Push: invoice paid, payment due, payment received, weekly digest |
| **Profile & Workspace** | Switch workspace, change theme, sign out, invite teammate (deep-links to web) |

### Explicitly NOT in v1

- POS / cashier mode (→ Phase 2)
- Bank reconciliation (web-only — too dense for mobile)
- Full report viewers — only the dashboard summary tiles in v1
- Multi-line journal entries (web-only)
- Year-end closing (web-only)
- Stock / inventory adjustments (Phase 2)

### Phase 2 (post-launch, ~3 months later)

- POS mode (cashier UI for tablets)
- OCR receipt parsing (auto-fill amount, date, merchant)
- Inventory: stock count, low-stock alerts, transfers
- Approvals: bills awaiting payment, expenses awaiting review
- In-app payments (collect via the app)

### Phase 3 (later)

- Apple Watch glance widget (cash on hand)
- Wear OS tile equivalent
- Full report viewers (P&L, Balance Sheet — read-only, mobile-formatted)
- Multi-currency

## 5. Constraints / non-goals

- **No white-label in v1.** Single-brand scount.my app.
- **No hard offline mode.** Core read flows can be cached, but the app assumes internet most of the time. Capture flows queue.
- **No CRM, no chat.** Stay in our lane.
- **No third-party SDK that calls home with PII.** Analytics: PostHog self-hosted or none in v1. Crash reporting: Sentry (with tenant ID scrubbed from breadcrumbs).

## 6. Success metrics

We'll know the app is working if, six months post-launch:

| Metric | Target |
|---|---|
| Daily active users / monthly active users | ≥ 35% (good engagement for biz tool) |
| App-originated invoices / total invoices | ≥ 15% |
| App Store rating (iOS) | ≥ 4.5 |
| Play Store rating | ≥ 4.3 |
| Median session length | 60–120 sec (we want quick in/out, not session farming) |
| Crash-free sessions | ≥ 99.5% |
| Cold-start time on mid-tier device | < 1.5 sec |

## 7. Branding & app metadata

| Field | Value |
|---|---|
| App display name | **scount** |
| iOS bundle id | `my.scount.app` |
| Android package | `my.scount.app` |
| Primary colour | `#10B981` (moss-500) |
| App icon background | `#04110A` (ink-900) |
| App icon mark | The `S` monogram from the web mark |
| Tagline (store) | *Run the books, anywhere.* |
| Languages at launch | English (Bahasa Malaysia + Mandarin in Phase 2) |
| Region at launch | Malaysia (worldwide listing, but marketed to MY first) |
| Age rating | 4+ / Everyone (no objectionable content) |

## 8. Risks & open questions

| Risk | Mitigation |
|---|---|
| Backend doesn't have a mobile-ready API | Backend team builds `/api/v1/*` in parallel — see [`API-CONTRACT.md`](API-CONTRACT.md). Don't start app coding before auth + 1 read endpoint exist. |
| Apple review rejection (financial app, KYC concerns) | Privacy nutrition label done early. No card-data handling in app. Privacy policy URL ready. |
| Multi-tenant subdomain routing on mobile | App uses host-agnostic API endpoint `api.scount.my`; tenant inferred from authed user, not URL. |
| Push notifications expensive at scale | Use FCM (free for both platforms) and only send for user-actionable events, not analytics. |
| Offline writes conflicting with web edits | Use server-side `updated_at` for conflict detection; show "this changed on web" banner if so. |

## 9. What "done" looks like for the planning phase

Before we write a single line of app code, all of the following must be true:

- [ ] All 5 docs in this repo reviewed and approved by founder
- [ ] Backend team has read `API-CONTRACT.md` and committed to a delivery date for the auth + dashboard endpoints
- [ ] Apple Developer Program account created, payment in
- [ ] Google Play Console account created, payment in
- [ ] App icon designed and approved (1024×1024 master)
- [ ] Brand guideline noted in this repo (one page is enough)
- [ ] Decision made on analytics vendor (or "none in v1")

After that — kick off Phase 1 per [`ROADMAP.md`](ROADMAP.md).
