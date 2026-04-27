# scount.my — Mobile App

Native iOS and Android companion app for the scount.my cloud accounting platform.

> **Status:** Planning. No code yet. See [`docs/PLAN.md`](docs/PLAN.md) for the master plan.

## What this app is for

Mobile is for **on-the-go capture and oversight**, not heavy data entry. The web app (`scount.my`) stays the primary surface for closing books, running reports, and complex bookkeeping. The mobile app is for the moments when you're not at a desk:

- "Send the invoice now, before they leave."
- "Snap the receipt, classify it later."
- "Did the RM 12,400 invoice clear?"
- "Ring up a sale at the counter."
- "Get paged when something needs me."

## Documents in this repo

| Doc | What's in it |
|---|---|
| [`docs/PLAN.md`](docs/PLAN.md) | Master plan — scope, principles, what's in / out of MVP |
| [`docs/TECH-DECISIONS.md`](docs/TECH-DECISIONS.md) | Stack choices (React Native + Expo) and why |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phased delivery plan, milestones, target dates |
| [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) | What the Laravel backend needs to expose |
| [`docs/openapi.yaml`](docs/openapi.yaml) | OpenAPI 3.0.3 machine-readable companion to API-CONTRACT.md |
| [`docs/BACKEND-LAYOUT.md`](docs/BACKEND-LAYOUT.md) | Suggested Laravel file structure (controllers, requests, resources, policies, migrations) |
| [`docs/UI-DESIGN.md`](docs/UI-DESIGN.md) | Screen-by-screen UI spec — flow, layout, copy, states, interactions |
| [`docs/STORE-RELEASE.md`](docs/STORE-RELEASE.md) | Apple App Store + Google Play submission checklist |

## Visual mockups

Open in any browser. Each file has a light/dark toggle in the top bar.

| Mockup | What you see |
|---|---|
| [`mockups/preview.html`](mockups/preview.html) | First-run flow — splash → login → workspace → dashboard |
| [`mockups/quotation.html`](mockups/quotation.html) | Quotation workflow — list, detail, create |
| [`mockups/invoice.html`](mockups/invoice.html) | Invoice workflow — list, detail, create |
| [`mockups/contacts.html`](mockups/contacts.html) | Contacts workflow — list (Clients / Suppliers segmented), detail, create |
| [`mockups/more.html`](mockups/more.html) | More tab + Notifications inbox |

## Quick links

- Web app: https://scount.my
- Marketing site: https://scount.my
- Backend repo: `oneorzerotechnologies/Laravel12-scount`
- This app's GitHub repo (when created): `oneorzerotechnologies/scount_app`

## Read in this order

1. [`docs/PLAN.md`](docs/PLAN.md) — the why and what
2. [`docs/TECH-DECISIONS.md`](docs/TECH-DECISIONS.md) — the how
3. [`docs/ROADMAP.md`](docs/ROADMAP.md) — the when
4. [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md) — what the backend team builds in parallel
5. [`docs/STORE-RELEASE.md`](docs/STORE-RELEASE.md) — what we need before launch day
