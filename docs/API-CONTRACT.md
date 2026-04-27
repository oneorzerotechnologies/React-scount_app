# API Contract

What the Laravel backend (`oneorzerotechnologies/Laravel12-scount`) needs to expose for the mobile app to function. The mobile dev should not start coding until the **Phase-1 must-have** endpoints below are stubbed and reachable on staging.

> **Machine-readable companion:** [`openapi.yaml`](openapi.yaml) — OpenAPI 3.0.3 spec generated from this document. Use it for code-gen, Postman import, Scribe stub generation, or `redocly preview-docs docs/openapi.yaml` to render an interactive viewer. This markdown remains the canonical source; the YAML is regenerated to match.

## Conventions

- **Base URL:** `https://api.scount.my` (or `https://scount.my/api` if a separate api subdomain is too much for v1)
- **Versioning:** `/v1/...` prefix on every endpoint. `v1` never breaks; `v2` is a new prefix.
- **Auth:** Laravel Sanctum personal access tokens. Bearer header on every request after login.
- **Format:** JSON request and response. `Content-Type: application/json` and `Accept: application/json`.
- **Errors:** Standard HTTP status codes + `{ "message": "...", "errors": { "field": ["..."] } }` body.
- **Timestamps:** ISO 8601 in UTC (`2026-04-27T10:30:00Z`); the app converts to local for display.
- **Money:** Always two integer fields per amount — `amount_minor` (cents) + `currency` (ISO 4217 code). Never float.
- **IDs:** UUIDs preferred. If the existing app uses auto-increment IDs internally, expose them as strings.
- **Pagination:** Cursor-based (`?cursor=abc&limit=20`); response carries `next_cursor`.
- **Rate limit:** 60 requests/minute per token. Return `429` with `Retry-After` header.

## Phase 1 — Must-have for app v1.0

### Auth

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/auth/login` | Email + password → returns Sanctum token + user profile |
| `POST` | `/v1/auth/logout` | Revoke current token |
| `POST` | `/v1/auth/refresh` | Refresh token (extend expiry) |
| `GET`  | `/v1/auth/me` | Returns current user, default workspace, preferences |

#### `POST /v1/auth/login` request
```json
{ "email": "eva@example.com", "password": "...", "device_name": "Eva's iPhone" }
```
#### Response
```json
{
  "token": "1|abc...xyz",
  "expires_at": "2026-05-27T10:30:00Z",
  "user": {
    "id": "uuid",
    "name": "Eva Tan",
    "email": "eva@example.com",
    "default_workspace_id": "uuid",
    "workspaces": [
      { "id": "uuid", "name": "Acme Sdn Bhd", "role": "owner" }
    ]
  }
}
```

### Workspaces

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/v1/workspaces` | List the user's workspaces (id, name, role only) |
| `GET`  | `/v1/workspaces/{id}` | Workspace detail incl. **settings** (currency, tax config, defaults) |
| `POST` | `/v1/workspaces/{id}/select` | Set active workspace for this token; response carries settings inline |

#### Workspace settings — response shape

The settings object is the **single source of truth for the mobile UI's behaviour**. Whatever is configured on `scount.my` (currency, tax on/off, available tax codes, default due/expiry windows) flows through here; the app reads and renders accordingly. There is no mobile-side override.

```json
{
  "id":   "uuid",
  "name": "Acme Sdn Bhd",
  "role": "owner",
  "settings": {
    "currency":                   "MYR",
    "locale":                     "en-MY",
    "tax_enabled":                true,
    "default_tax_code":           "SST6",
    "tax_codes": [
      { "code": "SST6", "name": "SST",         "rate_pct": 6 },
      { "code": "ZRT",  "name": "Zero-rated",  "rate_pct": 0 }
    ],
    "quote_expires_default_days": 30,
    "invoice_due_default_days":   30,
    "delivery_default_days":      30,
    "permissions": {
      "quotations": { "create": true,  "update": true,  "delete": false },
      "invoices":   { "create": false, "update": false, "delete": false },
      "contacts":   { "create": true,  "update": true,  "delete": false }
    }
  }
}
```

**Tax follows the web.** If `tax_enabled` is `false`, the app suppresses every tax-related affordance — no per-line tax pill, no Tax row in the totals card, no `tax_code` picker in the create form, and `tax_minor` on the response is always `0`. If `tax_enabled` is `true`, the app shows tax inline as in the mockups, with the picker defaulting to `default_tax_code` and offering everything in `tax_codes`. Settings are pulled fresh on dashboard refresh and on workspace switch — the user never has to log out for an admin's tax-config change to take effect.

**Permissions follow the role.** `settings.permissions` is computed by the backend from the user's `role` on this workspace and shipped inline. The mobile UI reads these booleans to:
- Hide the Edit pencil + Delete affordances on detail screens when `update` / `delete` is `false`
- Hide the "+ New" CTA on list screens (and the empty-state CTA) when `create` is `false`
- Render a "Read-only · <ROLE>" pill + info banner on detail screens when any write boolean is `false`

The mobile client never reimplements role → permission logic. Reasonable defaults are documented in [`UI-DESIGN.md`](UI-DESIGN.md#permission-matrix-default-workspace-roles); the backend can deviate, and the mobile UI follows whatever booleans it gets.

**Record-level overrides.** Individual resource detail responses (`Quotation`, `Invoice`, `Contact`) carry optional top-level booleans `can_update` and `can_delete` that override the workspace defaults for that one record. Used for cases like "members can edit their own creations but not others'". When present on a resource response, mobile prefers them; when absent, mobile falls back to `settings.permissions.<resource>.<action>`.

**403 fallback.** If the user attempts an action despite the UI hiding it (race conditions, role just changed, deep-link from web), the API returns `403` with `{ "message": "...", "errors": { "permission": ["..."] } }`. Mobile renders the same bottom-sheet pattern as 409 with copy that names the role and the action — see Screen 09F in `UI-DESIGN.md`.

### Dashboard

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/dashboard` | "You're owed" hero + open quotes + overdue + 30-day collected + recent activity, in one round trip |

#### Response shape

Aligned with the Screen 04 mockup. Quote-to-cash only — no cash-on-hand or revenue-MTD fields in v1.

```json
{
  "youre_owed": {
    "amount_minor":     4780000,
    "currency":         "MYR",
    "unpaid_count":     8,
    "due_this_week":    3
  },
  "open_quotes": {
    "count":            12,
    "pipeline_minor":   8420000,
    "currency":         "MYR"
  },
  "overdue": {
    "count":            3,
    "amount_minor":     1840000,
    "currency":         "MYR"
  },
  "collected_30d": {
    "total_minor":      15640000,
    "currency":         "MYR",
    "series": [
      { "date": "2026-03-29", "amount_minor": 120000 },
      { "date": "2026-03-30", "amount_minor":  85000 }
    ]
  },
  "recent_activity": [
    {
      "id":          "uuid",
      "kind":        "invoice",
      "status":      "paid",
      "ref":         "INV-00482",
      "contact":     "PT Anugerah Sdn Bhd",
      "amount_minor": 1240000,
      "currency":    "MYR",
      "occurred_at": "2026-04-26T08:14:00Z"
    },
    {
      "id":          "uuid",
      "kind":        "quotation",
      "status":      "sent",
      "ref":         "QT-038",
      "contact":     "CityWorks",
      "amount_minor": 870000,
      "currency":    "MYR",
      "occurred_at": "2026-04-25T16:02:00Z"
    }
  ]
}
```

`kind` is one of `quotation` / `invoice`. `status` aligns with the per-kind statuses below.

### Quotations

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/v1/quotations?status=open&cursor=&limit=20` | List with filter (`open`, `accepted`, `declined`, `expired`, `all`) |
| `GET`    | `/v1/quotations/{id}` | Detail with line items |
| `POST`   | `/v1/quotations` | Create |
| `PATCH`  | `/v1/quotations/{id}` | Edit — same payload as create. Allowed while `status` is `draft`, `open`, or `declined`; rejected with `409` once `accepted` or converted. |
| `DELETE` | `/v1/quotations/{id}` | Soft-delete. Rejected with `409` once converted to an invoice (must delete the invoice first). |
| `POST`   | `/v1/quotations/{id}/accept` | Mark as accepted (button on the detail screen) |
| `POST`   | `/v1/quotations/{id}/decline` | Mark as declined |
| `POST`   | `/v1/quotations/{id}/convert-to-invoice` | One-tap conversion → returns the new invoice's id and ref |
| `GET`    | `/v1/quotations/{id}/pdf` | Returns a signed share URL |

#### Quotation create / edit — request shape
```json
{
  "contact_id":            "uuid",
  "issue_date":            "2026-04-27",
  "expires_at":            "2026-05-27",
  "delivery_days":         30,
  "currency":              "MYR",
  "line_items": [
    { "description": "Audit retainer · April",  "quantity": 1, "unit_price_minor": 800000, "tax_code": "SST6" },
    { "description": "Onboarding workshop",      "quantity": 4, "unit_price_minor": 50000,  "tax_code": null }
  ],
  "terms_and_conditions":  "Net 30 from acceptance. 50% non-refundable deposit upon signing.",
  "remarks":               "Please confirm by 30 Apr.",
  "internal_remarks":      "Margin 40% — repeat client."
}
```

`delivery_days` is an integer count of days; the app renders it as "Within N days". `remarks` is rendered on the customer-facing PDF; `internal_remarks` is **never** included on the PDF and is only visible to workspace members.

#### Quotation detail — response shape
```json
{
  "id":                    "uuid",
  "ref":                   "QT-038",
  "status":                "sent",
  "issue_date":            "2026-04-25",
  "expires_at":            "2026-05-25",
  "delivery_days":         30,
  "contact":               { "id": "uuid", "name": "CityWorks" },
  "currency":              "MYR",
  "subtotal_minor":        820000,
  "tax_minor":             49200,
  "total_minor":           869200,
  "line_items":            [ /* same shape as create */ ],
  "terms_and_conditions":  "Net 30 from acceptance. 50% non-refundable deposit upon signing.",
  "remarks":               "Please confirm by 30 Apr.",
  "internal_remarks":      "Margin 40% — repeat client.",
  "linked_invoice":        null,
  "share_url":             "https://scount.my/q/abc123",
  "created_at":            "2026-04-25T10:00:00Z",
  "updated_at":            "2026-04-25T10:00:00Z"
}
```

After conversion, `linked_invoice = { "id": "...", "ref": "INV-00510" }` and the quote becomes read-only. All four additional-info fields (`delivery_days`, `terms_and_conditions`, `remarks`, `internal_remarks`) are **copied verbatim** onto the new invoice; the user can edit them on the invoice without affecting the source quote.

### Invoices

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/v1/invoices?status=overdue&cursor=&limit=20` | List with filter (`draft`, `sent`, `paid`, `overdue`, `all`) |
| `GET`    | `/v1/invoices/{id}` | Detail with line items + payment history |
| `POST`   | `/v1/invoices` | Create (also the target of `convert-to-invoice` server-side) |
| `PATCH`  | `/v1/invoices/{id}` | Edit — same payload as create. Allowed while `status` is `draft` or `sent` with no payments recorded; otherwise `409`. |
| `DELETE` | `/v1/invoices/{id}` | Soft-delete. Rejected with `409` once any payment is recorded on web (payments must be voided there first). |
| `GET`    | `/v1/invoices/{id}/pdf` | Returns a signed share URL |

> **Reminders are web-only on v1.** No `POST /v1/invoices/{id}/reminders` is exposed to the mobile token. Sending a payment reminder is done from `scount.my` where the user can preview tone and recipient list. Mobile's role on overdues is to surface them on the dashboard and let the user forward the share link directly.

> **Payments are web-only on v1.** There is intentionally no `POST /v1/invoices/{id}/payments` endpoint exposed to the mobile token. The `payments[]` array on `GET /v1/invoices/{id}` is read-only. Recording, voiding, or manually marking paid all happen on `scount.my` behind the desktop confirmation flow. The mobile app surfaces computed status (`paid`, `partially_paid`, `unpaid`, `overdue`) and the read-only payment list, and gets paid-status notifications via push.

#### Billing cycles (recurring invoices)

When an invoice belongs to a recurring schedule configured on web, the detail response carries an additional `recurrence` object. The mobile **Upcoming cycles** card in 06B reads from this; one-off invoices return `recurrence: null` and the card is omitted. Cadence, anchor day, and end-date are configured on `scount.my` only — there is no mobile endpoint to create or modify a recurrence.

```json
"recurrence": {
  "enabled":         true,
  "frequency":       "monthly",
  "anchor_day":      23,
  "next_at":         "2026-05-23",
  "ends_at":         null,
  "upcoming_cycles": [
    { "issue_date": "2026-05-23", "amount_minor": 620000, "currency": "MYR" },
    { "issue_date": "2026-06-23", "amount_minor": 620000, "currency": "MYR" },
    { "issue_date": "2026-07-23", "amount_minor": 620000, "currency": "MYR" }
  ]
}
```

`upcoming_cycles` is capped at 3 entries to keep the mobile card scannable; the full schedule lives on the web detail page.

Invoice request/response shapes mirror Quotation including all four additional-info fields, but with `due_date` instead of `expires_at`, and an additional `paid_minor` / `payments[]` block plus the optional `recurrence` block in the detail response.

### Contacts

Single endpoint serves both clients and suppliers — the segmented Clients / Suppliers toggle in the app maps to a `?type=` query string.

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/v1/contacts?type=client&q=acme&cursor=` | Search-aware list |
| `GET`  | `/v1/contacts?type=supplier&q=&cursor=`   | Same, suppliers segment |
| `GET`  | `/v1/contacts/{id}` | Detail with statement / activity summary |
| `POST` | `/v1/contacts` | Create with `type: "client" \| "supplier"` |
| `PATCH` | `/v1/contacts/{id}` | Edit basic fields |

#### Contact create / shape
```json
{
  "type":         "client",
  "name":         "Acme Sdn Bhd",
  "email":        "billing@acme.example",
  "phone":        "+60123456789",
  "tax_id":       "20210101-12345",
  "address": {
    "line1":      "Lot 5, Jalan Kuching",
    "city":       "Kuching",
    "state":      "Sarawak",
    "postcode":   "93350",
    "country":    "MY"
  },
  "notes":        "Quarterly retainer client."
}
```

Same payload + `"type": "supplier"` registers a supplier. Both types share the schema; `type` is enforced at create-time and is immutable after.

### Push notification registration

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/devices` | Register Expo push token + platform + app version |
| `DELETE` | `/v1/devices/{token}` | Deregister on logout / uninstall |

### Version check

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/version-check?platform=ios&version=1.0.3` | Returns `{ status: "ok" \| "update_available" \| "force_update", store_url }` |

## Phase 2 — Capture flows + bills

Pulled out of Phase 1 to keep the v1 surface tight on quote-to-cash.

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/v1/expenses?cursor=&limit=20` | List |
| `POST` | `/v1/expenses` | Create with optional `receipt_upload_id` |
| `POST` | `/v1/uploads/receipts/sign` | Returns S3 signed URL for direct upload from app |
| `POST` | `/v1/uploads/receipts/{id}/parse` | OCR pipeline kicks off; returns parsed `{amount, date, merchant_guess}` |
| `GET`  | `/v1/categories` | Expense categories for the active workspace |
| `GET`  | `/v1/bills?cursor=&limit=20` | Vendor bills list |
| `POST` | `/v1/bills` | Create bill from supplier |
| `POST` | `/v1/bills/{id}/payments` | Record bill payment |
| `GET`  | `/v1/inventory/items?q=` | Stock list for invoice/quote line-item picker |

## Phase 3 — POS support

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/pos/sales` | Record a counter sale (touches inventory + revenue + journal) |
| `POST` | `/v1/pos/shifts/open` | Open a cashier shift |
| `POST` | `/v1/pos/shifts/{id}/close` | Close shift, generate Z-report |

## Errors — standard envelope

```json
HTTP 422
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "amount_minor": ["Must be greater than zero."]
  }
}
```

| Status | When |
|---|---|
| `400` | Malformed request |
| `401` | Token missing or invalid → app routes to login |
| `403` | Authenticated but no permission for this resource |
| `404` | Not found |
| `409` | Optimistic concurrency conflict (object updated on web) — app shows resolution dialog |
| `422` | Validation failure |
| `429` | Rate-limited — app shows soft retry |
| `5xx` | Server error — Sentry catches, app shows retry CTA |

## Backend work breakdown for Phase 1

Re-estimated against the narrowed v1 surface (no expenses, no separate vendor endpoints).

| Task | Estimated effort |
|---|---|
| Sanctum personal access token endpoints (login/logout/refresh/me) | 2 days |
| Workspace selection middleware (existing concept on web — reuse) | 1 day |
| `/v1/dashboard` quote-to-cash aggregation (you're owed, open quotes, overdue, collected 30d, recent activity) | 3 days |
| Quotation list + detail + create + edit + delete + accept / decline + convert-to-invoice | 6 days |
| Invoice list + detail (incl. recurrence read) + create + edit + delete (no record-payment, no send-reminder — both web-only) | 4 days |
| Contact endpoints (unified clients & suppliers with `type` filter) | 2 days |
| Device registration + push token table | 1 day |
| Version-check endpoint | 0.5 day |
| API rate limiting middleware | 0.5 day |
| API docs (OpenAPI / Scribe) | 2 days |
| **Total** | **~22 dev-days (≈ 4–5 weeks part-time)** |

Net change vs. the previous estimate: +2 days for edit + delete on both quotations and invoices (with their lifecycle guards); −1 day net for dropping both record-payment and send-reminder from the mobile surface (web-only on v1) while picking up the recurrence read on the detail response.

This needs to be done in parallel with mobile Phase 1 — backend dev should aim to have auth + dashboard live by end of mobile Week 1.
