# Store Release Checklist

What we need to ship to **Apple App Store** and **Google Play Store**. Use this as the gating list before submission.

## Accounts & costs

| Item | Cost | Owner | Status |
|---|---|---|---|
| Apple Developer Program | US$99 / year | Founder | ☐ |
| Google Play Console | US$25 one-time | Founder | ☐ |
| App Store Connect API key (for EAS Submit) | Free | Mobile dev | ☐ |
| Google Play service account (for EAS Submit) | Free | Mobile dev | ☐ |

## App identity

| Field | Value |
|---|---|
| Display name | **scount** |
| Subtitle (iOS, 30 chars) | *Cloud accounting, anywhere* |
| Short description (Android, 80 chars) | *Run the books on the go — invoices, expenses, dashboards.* |
| iOS bundle id | `my.scount.app` |
| Android package | `my.scount.app` |
| App category | Business / Finance |
| Age rating | 4+ (iOS) / Everyone (Android) |
| Languages at launch | English |

## Required artwork

| Asset | Spec | Notes |
|---|---|---|
| App icon — master | 1024 × 1024 px, PNG, no alpha | Generates all sizes via EAS / Expo |
| iOS splash | 1242 × 2436 (light + dark) | Brand mark on `#04110A` (dark) / `#F7FBF9` (light) |
| Android adaptive icon | foreground 432 × 432, background `#04110A` | |
| **iPhone screenshots** (6.7", 6.5", 5.5") | up to 10 each | Designed in Phase 3 |
| **iPad screenshots** (12.9", 11") | up to 10 each | Skip in v1 if not optimised for iPad |
| **Android phone screenshots** | up to 8 | |
| **Android tablet screenshots** | up to 8 | Skip in v1 |
| Feature graphic (Android) | 1024 × 500 | Hero shot of dashboard |
| App preview video | 15–30 sec, optional | Skip in v1 |

## Store listing copy

### Title
**scount — Cloud Accounting**

### Description (long)
> Run your books from your phone. scount is the mobile companion to scount.my — a complete cloud accounting platform built for small businesses, freelancers, and growing teams in Malaysia and across Southeast Asia.
>
> **What you can do on mobile:**
> • See where you stand at a glance — revenue, outstanding, cash on hand
> • Send invoices and chase overdues in seconds
> • Capture expense receipts with your camera
> • Look up customers, vendors, and invoice history
> • Get notified the moment an invoice is paid
>
> **Made for the moments you're not at a desk.** scount on mobile is fast, focused, and works in light or dark mode. Your data stays in sync with the web at every keystroke — no nightly batches, no spreadsheets.
>
> Need full bookkeeping, year-end closing, or bank reconciliation? Sign in at scount.my on the web — same account, same workspace.
>
> Built in Malaysia. Free to start.

### Keywords (iOS — 100 chars total)
`accounting,invoicing,bookkeeping,SME,small business,fintech,Malaysia,POS,expense,receipt`

### What's New (v1.0)
> The first release of scount on mobile. Sign in, see your numbers, send invoices, capture expenses — all from your phone.

### Promotional text (iOS, can be updated without resubmission)
> Now in beta — your books in your pocket. Free during early access.

## Privacy & data safety

### Privacy policy URL
`https://scount.my/privacy-policy` ✅ already live

### Terms of service URL
`https://scount.my/terms-of-service` ✅ already live

### Apple — Privacy Nutrition Label

We collect:
- **Contact Info** (name, email) — linked to user, used for app functionality
- **User Content** (photos for receipt capture) — linked to user, used for app functionality
- **Identifiers** (account ID) — linked to user
- **Diagnostics** (crash data, performance) — not linked to user

We do NOT collect:
- Location, browsing history, contacts, search history, sensitive info, or financial info from the device

We do NOT use any data for tracking or third-party advertising.

### Google Play — Data Safety form

Same content as the Apple label, in Play's question format. Confirm:
- Data is encrypted in transit ✅
- Data is encrypted at rest ✅
- Users can request deletion (link to in-app account deletion + privacy policy) ✅
- We do not share data with third parties (except essential service providers under contract — list cloud hosting, push notification provider)

## Compliance

| Requirement | Notes |
|---|---|
| **App Store Review Guideline 5.1.1** — privacy policy required | ✅ already published |
| **Guideline 4.0** — design quality | Phase 3 polish pass mandatory before submission |
| **Guideline 5.1.5** — account deletion in-app | "Delete account" link in More tab → confirmation → `/v1/account/delete` |
| **Play Policy — Data Safety** | Form completed in console |
| **Play Policy — Account Deletion** | Same as iOS — in-app deletion path |
| **Malaysian PDPA** | Data Protection Officer noted in privacy policy |
| **Malaysian Personal Data Protection Standard (PDPS)** | Encryption at rest + in transit ✅ |

## Reviewer instructions

App Store reviewers test the app — they need a working account.

```
Email:     reviewer+apple@scount.my
Password:  AppleR3v!ew2026
Workspace: Scount Demo (pre-seeded with sample data)
```

Generate the demo account in Phase 4. Reset its data weekly via a scheduled job.

For Play reviewers — same flow with `reviewer+play@scount.my`.

## Submission day playbook

### Day -3
- [ ] Final production build via EAS for both platforms
- [ ] Run on real iPhone + real Android device, top to bottom
- [ ] Confirm dashboard data matches web exactly
- [ ] Confirm push notification end-to-end (send a test invoice paid event)
- [ ] Sentry shows zero P0 issues for 7 consecutive days

### Day -1
- [ ] App Store Connect listing reviewed by founder + mobile dev
- [ ] Play Console listing reviewed by founder + mobile dev
- [ ] Demo accounts seeded
- [ ] Reviewer credentials added to both submission forms

### Day 0 — submit
- [ ] iOS: submit for review via App Store Connect
- [ ] Android: submit for review via Play Console (Internal → Production with phased rollout 10%)
- [ ] Set up daily check-in with mobile dev for review status

### Day +1 to +7 — review window
- [ ] Watch email for reviewer feedback; respond same day
- [ ] If iOS rejection: turn around within 24h; common reasons: missing privacy details, demo account broken, copy claims that overstate features

### Launch day
- [ ] Marketing site footer: app store badges go from "Coming soon" to live store URLs
- [ ] Post on LinkedIn + newsletter (founder)
- [ ] Push announcement notification to web users opted into notifications
- [ ] Monitor Sentry, App Store reviews, Play Store reviews — first 48h is critical

## Post-launch maintenance commitments

| What | Cadence |
|---|---|
| Bug-fix release (OTA) | Within 24h of P0 bug |
| Bug-fix release (binary) | Weekly during first month, biweekly after |
| Feature release | Monthly (aligned with web releases) |
| Respond to App Store / Play reviews | Within 48h, every review |
| Sentry crash review | Daily during launch month, weekly after |
| Force-update threshold | Major API breaking change (rare) |
