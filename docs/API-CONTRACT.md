# API Contract

What the Laravel backend (`oneorzerotechnologies/Laravel12-scount`) needs to expose for the mobile app to function. The mobile dev should not start coding until the **Phase-1 must-have** endpoints below are stubbed and reachable on staging.

## Conventions

- **Base URL:** `https://api.scount.my` (or `https://app.scount.my/api` if a separate api subdomain is too much for v1)
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
| `GET`  | `/v1/workspaces` | List the user's workspaces |
| `POST` | `/v1/workspaces/{id}/select` | Set active workspace for this token |

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
| `GET`  | `/v1/quotations?status=open&cursor=&limit=20` | List with filter (`open`, `accepted`, `declined`, `expired`, `all`) |
| `GET`  | `/v1/quotations/{id}` | Detail with line items |
| `POST` | `/v1/quotations` | Create |
| `POST` | `/v1/quotations/{id}/accept` | Mark as accepted (button on the detail screen) |
| `POST` | `/v1/quotations/{id}/decline` | Mark as declined |
| `POST` | `/v1/quotations/{id}/convert-to-invoice` | One-tap conversion → returns the new invoice's id and ref |
| `GET`  | `/v1/quotations/{id}/pdf` | Returns a signed share URL |

#### Quotation create — request shape
```json
{
  "contact_id":      "uuid",
  "issue_date":      "2026-04-27",
  "expires_at":      "2026-05-27",
  "currency":        "MYR",
  "line_items": [
    { "description": "Audit retainer · April",  "quantity": 1, "unit_price_minor": 800000, "tax_code": "SST6" },
    { "description": "Onboarding workshop",      "quantity": 4, "unit_price_minor": 50000,  "tax_code": null }
  ],
  "notes":           "Net 30 from acceptance."
}
```

#### Quotation detail — response shape
```json
{
  "id":              "uuid",
  "ref":             "QT-038",
  "status":          "sent",
  "issue_date":      "2026-04-25",
  "expires_at":      "2026-05-25",
  "contact":         { "id": "uuid", "name": "CityWorks" },
  "currency":        "MYR",
  "subtotal_minor":  820000,
  "tax_minor":       49200,
  "total_minor":     869200,
  "line_items":      [ /* same shape as create */ ],
  "notes":           "Net 30 from acceptance.",
  "linked_invoice":  null,
  "share_url":       "https://app.scount.my/q/abc123",
  "created_at":      "2026-04-25T10:00:00Z",
  "updated_at":      "2026-04-25T10:00:00Z"
}
```

After conversion, `linked_invoice = { "id": "...", "ref": "INV-00510" }` and the quote becomes read-only.

### Invoices

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/v1/invoices?status=overdue&cursor=&limit=20` | List with filter (`draft`, `sent`, `paid`, `overdue`, `all`) |
| `GET`  | `/v1/invoices/{id}` | Detail with line items + payment history |
| `POST` | `/v1/invoices` | Create (also the target of `convert-to-invoice` server-side) |
| `POST` | `/v1/invoices/{id}/payments` | Record payment |
| `GET`  | `/v1/invoices/{id}/pdf` | Returns a signed share URL |

Invoice request/response shapes mirror Quotation but with `due_date` instead of `expires_at` and an additional `paid_minor` / `payments[]` block in the detail response.

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
| Quotation list + detail + create + accept / decline + convert-to-invoice | 5 days |
| Invoice list + detail + create + record-payment | 4 days |
| Contact endpoints (unified clients & suppliers with `type` filter) | 2 days |
| Device registration + push token table | 1 day |
| Version-check endpoint | 0.5 day |
| API rate limiting middleware | 0.5 day |
| API docs (OpenAPI / Scribe) | 2 days |
| **Total** | **~21 dev-days (≈ 4–5 weeks part-time)** |

The total is unchanged from the previous estimate — the time we save by dropping expenses + vendor CRUD is reinvested in the quotation endpoints (especially convert-to-invoice, which has to handle tax recalc, ledger postings, and idempotency).

This needs to be done in parallel with mobile Phase 1 — backend dev should aim to have auth + dashboard live by end of mobile Week 1.
