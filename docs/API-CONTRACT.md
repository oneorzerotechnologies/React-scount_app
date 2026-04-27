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
| `GET` | `/v1/dashboard` | KPIs + 30-day cash flow + recent transactions, in one round trip |

#### Response shape
```json
{
  "kpis": {
    "revenue_mtd":      { "amount_minor": 18420900, "currency": "MYR", "delta_pct": 12.4 },
    "outstanding":      { "amount_minor": 4780000,  "currency": "MYR", "invoice_count": 8 },
    "cash_on_hand":     { "amount_minor": 31254000, "currency": "MYR", "account_count": 3 }
  },
  "cash_flow_30d": [
    { "date": "2026-03-29", "net_minor": 120000 },
    { "date": "2026-03-30", "net_minor":  85000 }
  ],
  "recent_transactions": [
    {
      "id": "uuid",
      "type": "invoice",
      "ref": "INV-00482",
      "party": "PT Anugerah Sdn Bhd",
      "amount_minor": 1240000,
      "currency": "MYR",
      "status": "paid",
      "occurred_at": "2026-04-26T08:14:00Z"
    }
  ]
}
```

### Invoices

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/v1/invoices?status=paid&cursor=&limit=20` | List with filter |
| `GET`  | `/v1/invoices/{id}` | Detail with line items and payment history |
| `POST` | `/v1/invoices` | Create |
| `POST` | `/v1/invoices/{id}/payments` | Record payment |
| `GET`  | `/v1/invoices/{id}/pdf` | Returns a signed share URL |

### Expenses

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/v1/expenses?cursor=&limit=20` | List |
| `POST` | `/v1/expenses` | Create with optional `receipt_upload_id` |
| `POST` | `/v1/uploads/receipts/sign` | Returns S3 signed URL for direct upload from app |

### Customers + Vendors

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/v1/customers?q=acme&cursor=` | Search-aware list |
| `GET`  | `/v1/customers/{id}` | Detail with statement summary |
| `POST` | `/v1/customers` | Create |
| `GET`  | `/v1/vendors` | (mirror of customers) |
| `POST` | `/v1/vendors` | (mirror) |

### Push notification registration

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/devices` | Register Expo push token + platform + app version |
| `DELETE` | `/v1/devices/{token}` | Deregister on logout / uninstall |

### Version check

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/version-check?platform=ios&version=1.0.3` | Returns `{ status: "ok" \| "update_available" \| "force_update", store_url }` |

## Phase 2 — Add when capture flows ship

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/uploads/receipts/{id}/parse` | OCR pipeline kicks off; returns parsed `{amount, date, merchant_guess}` |
| `GET`  | `/v1/categories` | Expense categories for the active workspace |
| `GET`  | `/v1/inventory/items?q=` | Stock list for invoice line-item picker |

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

| Task | Estimated effort |
|---|---|
| Sanctum personal access token endpoints (login/logout/refresh/me) | 2 days |
| Workspace selection middleware (existing concept on web — reuse) | 1 day |
| `/v1/dashboard` aggregation query (consolidate existing KPI logic) | 3 days |
| Invoice list + detail + create + record-payment endpoints | 5 days |
| Expense list + create + signed upload URL | 3 days |
| Customer + vendor CRUD endpoints | 3 days |
| Device registration + push token table | 1 day |
| Version-check endpoint | 0.5 day |
| API rate limiting middleware | 0.5 day |
| API docs (OpenAPI / Scribe) | 2 days |
| **Total** | **~21 dev-days (≈ 4–5 weeks part-time)** |

This needs to be done in parallel with mobile Phase 1 — backend dev should aim to have auth + dashboard live by end of mobile Week 1.
