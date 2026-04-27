# Roadmap

Phased delivery from kickoff to v1.0 launch on both stores. Estimates assume **one full-time mobile dev + part-time backend dev** in parallel.

## At a glance

```
Phase 0  Planning + setup        [ ████  ]  2 weeks
Phase 1  Auth + dashboard        [ ████████  ]  4 weeks
Phase 2  Capture flows           [ ████████  ]  4 weeks
Phase 3  Polish + push           [ ██████  ]  3 weeks
Phase 4  Closed beta             [ ████  ]  2 weeks
Phase 5  Store submission        [ ██████  ]  3 weeks
                                 ─────────────
                          Total: ~18 weeks (≈ 4.5 months)
```

## Phase 0 — Planning & foundation (2 weeks)

**Goal:** No coding yet. Decisions made, accounts set up, infrastructure ready.

- [ ] Founder reviews + approves all five planning docs
- [ ] Apple Developer Program account created (US$99/yr — pay & enroll)
- [ ] Google Play Console account created (US$25 one-time)
- [ ] Backend team commits delivery dates for `API-CONTRACT.md` Phase-1 endpoints
- [ ] App icon designed in `1024×1024` master, exported to all required sizes
- [ ] App name reserved on both stores
- [ ] Brand guideline doc (one page) added to repo
- [ ] GitHub repo `scount_app` created and access set up
- [ ] EAS account created and linked to GitHub
- [ ] Decision: analytics in v1 — yes (PostHog) or no
- [ ] Decision: bug bounty for the app — yes / no

**Exit criteria:** every checkbox above is ticked. We do not start Phase 1 a day earlier.

## Phase 1 — Auth + dashboard (4 weeks)

**Goal:** A user can install the app, log in, and see their cash position. Read-only.

### Week 1
- Repo bootstrapped with Expo, TypeScript strict, ESLint, Prettier, Husky
- Theme tokens (`colors.ts`, `typography.ts`, `spacing.ts`) ported from web design
- App shell: tab bar, splash screen, light/dark theme switching
- Login screen wired to `/api/v1/auth/login`, token stored in secure store

### Week 2
- Workspace switcher (multi-tenant users can swap)
- Biometric unlock on cold start (post first login)
- Network client + TanStack Query setup
- Dashboard skeleton with loading & empty states

### Week 3
- Dashboard KPIs (revenue MTD, outstanding, cash on hand) backed by `/api/v1/dashboard`
- Cash-flow sparkline (Victory Native or React Native Skia — decide on first benchmark)
- Recent transactions list (last 5)

### Week 4
- "More" tab: profile, theme toggle, sign out, app version, send feedback
- Pull-to-refresh on dashboard
- Force-update gate on cold start (if backend says minimum version not met)
- Internal smoke test on real iOS + Android device
- Sentry integration verified

**Exit criteria:** founder uses the app on their own phone for one week and the dashboard data matches the web exactly.

## Phase 2 — Capture flows (4 weeks)

**Goal:** Users can create invoices and capture expenses on the phone.

### Week 5
- Customer list + detail screen
- Customer create form (≤ 5 fields)
- Search / filter on customer list

### Week 6
- Invoice list + filters (paid / sent / overdue / draft)
- Invoice detail screen with status, line items, payment history
- Send invoice via share sheet (PDF rendered server-side, deep link to web)

### Week 7
- Invoice create form: customer → line items → due date → save
- Mark invoice as paid (records payment)
- Vendor list + create form (mirror customer flow)

### Week 8
- Expense capture: photo → amount → category → vendor → save
- Photo upload to S3 via signed URL endpoint
- Local queue for offline captures (SQLite via `expo-sqlite`)
- Background sync when reconnected

**Exit criteria:** founder creates a full invoice, gets paid, captures three receipts — all from the app, with no web fallback needed.

## Phase 3 — Polish + push notifications (3 weeks)

**Goal:** App feels solid. Notifications drive return visits.

### Week 9
- Push notification permissions flow (gentle, with a clear "why")
- Token registration to backend on login
- Notification categories: invoice-paid, payment-received, weekly-digest
- Settings screen: per-category mute toggles

### Week 10
- Empty states designed for every list screen
- Skeleton loaders (not spinners)
- Smooth transitions between screens (Expo Router shared element where it adds value)
- Haptics on key actions (record-payment success, etc.)
- Accessibility audit: dynamic type, VoiceOver, TalkBack

### Week 11
- Performance pass: cold-start under 1.5s on mid-tier device, scroll at 60 fps on lists
- Bundle size budget: < 25 MB initial download
- Crash-free targeting: 99.9% in instrumentation
- App Store screenshots designed (10 per platform)

**Exit criteria:** internal team uses the app daily for two weeks, no P0 bugs in week 2.

## Phase 4 — Closed beta (2 weeks)

**Goal:** Real users, real bugs, real feedback before we ship.

- TestFlight (iOS) — invite 25 users; mix of solo founders, SMEs, accountants
- Play Internal Testing (Android) — same cohort, parallel rollout
- Weekly feedback survey embedded in app (no third-party)
- Daily triage of crashes (Sentry) and feedback
- Two OTA fixes per week as needed
- Final copy review with founder

**Exit criteria:** ≥ 80% of beta users say they'd use the app weekly. Crash rate < 0.5%.

## Phase 5 — Store submission + launch (3 weeks)

**Goal:** Live in both stores.

### Week 16
- App Store Connect listing complete (description, keywords, screenshots, privacy nutrition)
- Play Console listing complete (description, screenshots, content rating, data safety)
- Privacy policy URL pointing to https://scount.my/privacy-policy ✅ (already live)
- Terms of service URL pointing to https://scount.my/terms-of-service ✅
- Demo account credentials prepared for App Store reviewers
- Production EAS Build pushed for both platforms

### Week 17
- App Store submission — expect 2–7 day review
- Play Store submission — expect 1–3 day review
- Address any reviewer feedback within 24 hours

### Week 18 — Launch week
- Phased rollout on Play (10% → 50% → 100% over 4 days)
- iOS phased release toggled on in App Store Connect (7 days)
- Marketing site updated: app store badges flip from "Coming soon" to live links
- In-app prompt on web app: "Get the mobile app" (one-time, dismissible)
- Soft launch announcement in newsletter + LinkedIn

**Exit criteria:** v1.0.0 live on both stores, marketing site updated, no P0 bugs in launch week.

## After launch — what we measure in week 1, 4, 12

| Metric | Week 1 | Week 4 | Week 12 |
|---|---|---|---|
| Installs | — | 500+ | 2,500+ |
| DAU/MAU | — | 25% | 35% |
| Crash-free sessions | 99.5% | 99.5% | 99.9% |
| App Store rating | — | 4.2+ | 4.5+ |
| Play Store rating | — | 4.0+ | 4.3+ |
| App-originated invoices share | — | 5% | 15% |

If any week-12 metric misses by > 20%, we cut a Phase 6 to address before kicking off Phase 2 work in [`PLAN.md`](PLAN.md).

## Risks to the timeline

| Risk | Likelihood | Mitigation |
|---|---|---|
| Backend API delivery slips | Medium | Phase 1 mocks the dashboard endpoint; we keep building UI while backend catches up |
| Apple review rejection (financial app concerns) | Low–Medium | Phase 5 starts a week early so we have buffer for resubmission |
| Designer not available for screenshots | Medium | Lock in designer time at end of Phase 3, not Phase 5 |
| Beta cohort doesn't materialise | Low | Pre-recruit beta users in Phase 0 from existing scount.my customer list |
| OTA update breaks production | Low | Every OTA gated by version compatibility check; we can roll back in 5 minutes |
