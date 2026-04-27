# Backend Layout

Suggested file structure for the Laravel side (`oneorzerotechnologies/Laravel12-scount`) to expose the v1 mobile API. Pairs with [`API-CONTRACT.md`](API-CONTRACT.md) and [`openapi.yaml`](openapi.yaml).

This is a recommendation, not a mandate — the Laravel team may already have conventions that lean differently. The goal is to give every endpoint a predictable home so the mobile dev and the backend dev can talk in the same vocabulary.

## File tree

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/
│   │           ├── AuthController.php              # login · logout · refresh · me
│   │           ├── WorkspaceController.php          # index · show · select
│   │           ├── DashboardController.php          # show
│   │           ├── QuotationController.php          # index · show · store · update · destroy
│   │           ├── QuotationActionController.php    # accept · decline · convertToInvoice
│   │           ├── QuotationPdfController.php       # show (signed share-url)
│   │           ├── InvoiceController.php            # index · show · store · update · destroy
│   │           ├── InvoicePdfController.php         # show
│   │           ├── ContactController.php            # index · show · store · update
│   │           ├── DeviceController.php             # store · destroy
│   │           └── VersionCheckController.php       # show
│   ├── Middleware/
│   │   ├── EnsureWorkspaceContext.php               # picks active workspace from token
│   │   └── ApiRateLimit.php                         # 60 req/min/token; 429 + Retry-After
│   ├── Requests/
│   │   └── Api/
│   │       └── V1/
│   │           ├── LoginRequest.php
│   │           ├── QuotationStoreRequest.php
│   │           ├── QuotationUpdateRequest.php       # extends store; relies on policy for guards
│   │           ├── InvoiceStoreRequest.php
│   │           ├── InvoiceUpdateRequest.php
│   │           ├── ContactStoreRequest.php
│   │           ├── ContactUpdateRequest.php         # rejects `type` field server-side (immutable)
│   │           └── DeviceRegisterRequest.php
│   └── Resources/
│       └── Api/
│           └── V1/
│               ├── UserResource.php
│               ├── WorkspaceSummaryResource.php
│               ├── WorkspaceResource.php            # WorkspaceSummary + settings
│               ├── DashboardResource.php
│               ├── QuotationSummaryResource.php
│               ├── QuotationResource.php            # full detail incl. line_items + 4 additional-info fields + linked_invoice
│               ├── InvoiceSummaryResource.php
│               ├── InvoiceResource.php              # full detail incl. payments[] + recurrence + 4 additional-info fields
│               ├── ContactResource.php
│               ├── LineItemResource.php
│               ├── PaymentResource.php              # read-only on mobile token
│               └── RecurrenceResource.php           # nullable; max 3 upcoming_cycles
│
├── Models/
│   ├── Quotation.php
│   ├── Invoice.php
│   ├── LineItem.php                                 # polymorphic: belongs to quotation OR invoice
│   ├── Payment.php
│   ├── Contact.php                                  # type: client | supplier
│   ├── Recurrence.php                               # belongs to invoice
│   ├── Device.php                                   # expo push tokens
│   ├── Workspace.php                                # existing — extend with settings()
│   └── User.php                                     # existing
│
├── Services/
│   ├── Quotation/
│   │   └── ConvertToInvoice.php                    # copies all fields incl. delivery_days, terms_and_conditions, remarks, internal_remarks; posts to ledger
│   ├── Dashboard/
│   │   └── Aggregate.php                            # the single dashboard query
│   ├── Pdf/
│   │   └── ShareLinkSigner.php                      # short-lived signed URL → scount.my/q/<token>
│   └── Push/
│       └── DeviceRegistrar.php
│
└── Policies/
    ├── QuotationPolicy.php                          # update blocked when accepted/converted; delete blocked when converted
    ├── InvoicePolicy.php                            # update blocked when paid; delete blocked when any payment recorded
    └── ContactPolicy.php

bootstrap/
└── app.php                                          # streamlined Laravel structure: register middleware groups + auth guard

routes/
└── api.php                                          # mounts /v1 routes — see snippet below

database/
└── migrations/
    ├── 2026_xx_xx_create_quotations_table.php
    ├── 2026_xx_xx_create_invoices_table.php
    ├── 2026_xx_xx_create_recurrences_table.php
    ├── 2026_xx_xx_create_contacts_table.php
    ├── 2026_xx_xx_create_line_items_table.php       # polymorphic — itemable_type, itemable_id
    ├── 2026_xx_xx_create_payments_table.php
    └── 2026_xx_xx_create_devices_table.php

config/
└── scount.php                                       # tax codes, default windows, share-link TTL
```

## Routes — `routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1;

Route::prefix('v1')->group(function () {

    // Public — no auth
    Route::post('auth/login', [V1\AuthController::class, 'login']);
    Route::get('version-check', [V1\VersionCheckController::class, 'show']);

    // Authed — Sanctum bearer token, rate-limited, workspace-aware
    Route::middleware(['auth:sanctum', 'api.rate', 'workspace.context'])->group(function () {

        Route::post('auth/logout',  [V1\AuthController::class, 'logout']);
        Route::post('auth/refresh', [V1\AuthController::class, 'refresh']);
        Route::get ('auth/me',      [V1\AuthController::class, 'me']);

        Route::get ('workspaces',                [V1\WorkspaceController::class, 'index']);
        Route::get ('workspaces/{workspace}',    [V1\WorkspaceController::class, 'show']);
        Route::post('workspaces/{workspace}/select', [V1\WorkspaceController::class, 'select']);

        Route::get('dashboard', [V1\DashboardController::class, 'show']);

        Route::apiResource('quotations', V1\QuotationController::class);
        Route::post('quotations/{quotation}/accept',             [V1\QuotationActionController::class, 'accept']);
        Route::post('quotations/{quotation}/decline',            [V1\QuotationActionController::class, 'decline']);
        Route::post('quotations/{quotation}/convert-to-invoice', [V1\QuotationActionController::class, 'convertToInvoice']);
        Route::get ('quotations/{quotation}/pdf',                [V1\QuotationPdfController::class, 'show']);

        Route::apiResource('invoices', V1\InvoiceController::class);
        Route::get('invoices/{invoice}/pdf', [V1\InvoicePdfController::class, 'show']);
        // Note: NO POST /invoices/{id}/payments — payments are web-only.
        // Note: NO POST /invoices/{id}/reminders — reminders are web-only.

        Route::apiResource('contacts', V1\ContactController::class)->except(['destroy']);

        Route::post  ('devices',         [V1\DeviceController::class, 'store']);
        Route::delete('devices/{token}', [V1\DeviceController::class, 'destroy']);
    });
});
```

`api.rate` and `workspace.context` are aliases registered in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'api.rate'          => \App\Http\Middleware\ApiRateLimit::class,
        'workspace.context' => \App\Http\Middleware\EnsureWorkspaceContext::class,
    ]);
})
```

## Controller skeleton — `QuotationController`

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\QuotationStoreRequest;
use App\Http\Requests\Api\V1\QuotationUpdateRequest;
use App\Http\Resources\Api\V1\QuotationResource;
use App\Http\Resources\Api\V1\QuotationSummaryResource;
use App\Models\Quotation;
use Illuminate\Http\Request;

class QuotationController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->validate([
            'status' => 'sometimes|in:open,accepted,declined,expired,converted,all',
            'cursor' => 'sometimes|string',
            'limit'  => 'sometimes|integer|min:1|max:100',
        ])['status'] ?? 'open';

        $query = Quotation::forWorkspace($request->workspace())
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->orderByDesc('created_at');

        return QuotationSummaryResource::collection(
            $query->cursorPaginate($request->integer('limit', 20))
        );
    }

    public function show(Quotation $quotation)
    {
        $this->authorize('view', $quotation);
        return new QuotationResource($quotation->load('lineItems', 'contact', 'linkedInvoice'));
    }

    public function store(QuotationStoreRequest $request)
    {
        $quotation = Quotation::createWithLineItems($request->validated());
        return (new QuotationResource($quotation))->response()->setStatusCode(201);
    }

    public function update(QuotationUpdateRequest $request, Quotation $quotation)
    {
        $this->authorize('update', $quotation);   // policy enforces lifecycle guard → 409
        $quotation->updateWithLineItems($request->validated());
        return new QuotationResource($quotation->fresh());
    }

    public function destroy(Quotation $quotation)
    {
        $this->authorize('delete', $quotation);   // 409 if linked_invoice exists
        $quotation->delete();
        return response()->noContent();
    }
}
```

## Form request — `QuotationStoreRequest`

```php
<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class QuotationStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'contact_id'                       => ['required', 'uuid', 'exists:contacts,id'],
            'issue_date'                       => ['required', 'date'],
            'expires_at'                       => ['required', 'date', 'after_or_equal:issue_date'],
            'delivery_days'                    => ['nullable', 'integer', 'min:0', 'max:365'],
            'currency'                         => ['required', 'string', 'size:3'],
            'line_items'                       => ['required', 'array', 'min:1'],
            'line_items.*.description'         => ['required', 'string', 'max:500'],
            'line_items.*.quantity'            => ['required', 'numeric', 'min:0'],
            'line_items.*.unit_price_minor'    => ['required', 'integer', 'min:0'],
            'line_items.*.tax_code'            => ['nullable', 'string', 'exists:tax_codes,code'],
            'terms_and_conditions'             => ['nullable', 'string', 'max:5000'],
            'remarks'                          => ['nullable', 'string', 'max:2000'],
            'internal_remarks'                 => ['nullable', 'string', 'max:2000'],
        ];
    }
}
```

`QuotationUpdateRequest` extends `QuotationStoreRequest`; it doesn't redeclare rules. The lifecycle guard (no edits once accepted/converted) belongs in the **policy**, not the request — that way the same guard fires on direct API calls and any internal callers.

## Policy — `QuotationPolicy`

```php
<?php

namespace App\Policies;

use App\Models\Quotation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuotationPolicy
{
    public function view(User $user, Quotation $quotation): bool
    {
        return $user->belongsToWorkspace($quotation->workspace_id);
    }

    public function update(User $user, Quotation $quotation): Response
    {
        if (!$user->belongsToWorkspace($quotation->workspace_id)) {
            return Response::deny('Not in this workspace.', 403);
        }

        if (in_array($quotation->status, ['accepted', 'converted'])) {
            return Response::deny('Cannot edit an accepted or converted quote.', 409);
        }

        return Response::allow();
    }

    public function delete(User $user, Quotation $quotation): Response
    {
        if (!$user->belongsToWorkspace($quotation->workspace_id)) {
            return Response::deny('Not in this workspace.', 403);
        }

        if ($quotation->linked_invoice_id !== null) {
            return Response::deny('Cannot delete a quote that has been converted. Delete the invoice first.', 409);
        }

        return Response::allow();
    }
}
```

`InvoicePolicy` follows the same shape: `update` denies once any payment exists, `delete` denies once `paid_minor > 0`.

## API Resource — `QuotationResource`

```php
<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'ref'                   => $this->ref,
            'status'                => $this->status,
            'issue_date'            => $this->issue_date->toDateString(),
            'expires_at'            => $this->expires_at->toDateString(),
            'delivery_days'         => $this->delivery_days,
            'contact'               => [
                'id'   => $this->contact->id,
                'name' => $this->contact->name,
            ],
            'currency'              => $this->currency,
            'subtotal_minor'        => $this->subtotal_minor,
            'tax_minor'             => $this->tax_minor,
            'total_minor'           => $this->total_minor,
            'line_items'            => LineItemResource::collection($this->lineItems),
            'terms_and_conditions'  => $this->terms_and_conditions,
            'remarks'               => $this->remarks,
            'internal_remarks'      => $this->internal_remarks,
            'linked_invoice'        => $this->whenLoaded('linkedInvoice', fn () => $this->linkedInvoice ? [
                'id'  => $this->linkedInvoice->id,
                'ref' => $this->linkedInvoice->ref,
            ] : null),
            'share_url'             => app(\App\Services\Pdf\ShareLinkSigner::class)->forQuotation($this->resource),
            'created_at'            => $this->created_at->toIso8601String(),
            'updated_at'            => $this->updated_at->toIso8601String(),
        ];
    }
}
```

## Migration columns to remember

The four additional-info fields and the recurrence FK are easy to forget — they are **non-negotiable** per the design.

```php
// quotations table
$table->integer('delivery_days')->nullable();
$table->text('terms_and_conditions')->nullable();
$table->text('remarks')->nullable();           // PDF-visible
$table->text('internal_remarks')->nullable();  // PDF-hidden
$table->foreignUuid('linked_invoice_id')->nullable()->constrained('invoices');

// invoices table
$table->integer('delivery_days')->nullable();
$table->text('terms_and_conditions')->nullable();
$table->text('remarks')->nullable();
$table->text('internal_remarks')->nullable();
$table->foreignUuid('recurrence_id')->nullable()->constrained();
$table->foreignUuid('from_quotation_id')->nullable()->constrained('quotations');

// recurrences table
$table->uuid('id')->primary();
$table->foreignUuid('workspace_id')->constrained();
$table->boolean('enabled')->default(true);
$table->enum('frequency', ['weekly', 'monthly', 'quarterly', 'yearly']);
$table->unsignedTinyInteger('anchor_day');
$table->date('next_at');
$table->date('ends_at')->nullable();
$table->timestamps();

// contacts table
$table->enum('type', ['client', 'supplier']);  // immutable after create
```

## Conventions worth keeping consistent

1. **Money** — every monetary column ends in `_minor` and stores integers. A separate `currency` column (or a workspace-level default) carries the ISO code. Never `decimal(13,2)`.
2. **UUIDs** — primary keys are UUIDs, exposed as strings in JSON. The mobile client never sees auto-increment IDs.
3. **Cursor pagination** — every list endpoint cursor-paginates. `next_cursor` lives next to `data`.
4. **Workspace scoping** — every model in this layout has a `workspace_id`. The `EnsureWorkspaceContext` middleware sets the active workspace on the request; query scopes use it. Never trust a workspace_id from the request body.
5. **Soft deletes** — quotations, invoices, contacts, payments all use `SoftDeletes`. `DELETE` endpoints set `deleted_at`; web admins can restore.
6. **Lifecycle guards in policies** — the `accepted` / `converted` / `paid` guards live in policy methods, not in form requests or controllers. Single source of truth, returns the right HTTP code (`409`).
7. **No mobile write paths for payments or reminders** — the controllers and routes simply don't exist on the mobile-API side. Web-side controllers can live in their own namespace (`App\Http\Controllers\Web\`) and won't accidentally leak to the mobile token.

## Backend dev's checklist (to hand off)

- [ ] Migrations for the 7 new tables (incl. recurrences, devices)
- [ ] Models with relationships + workspace scopes
- [ ] All controllers in `Api/V1/` with method stubs
- [ ] Form requests for create + update + register-device
- [ ] API resources matching `openapi.yaml` schemas
- [ ] Policies for Quotation, Invoice, Contact (with the lifecycle guards)
- [ ] `EnsureWorkspaceContext` + `ApiRateLimit` middleware
- [ ] Sanctum personal-access-token endpoints (login/logout/refresh/me)
- [ ] `convert-to-invoice` service that copies the four additional-info fields verbatim
- [ ] Dashboard aggregator service (single query, no N+1)
- [ ] PDF share-link signer (short-lived JWT or signed URL → `scount.my/q/<token>`)
- [ ] Push token registrar with platform + app_version columns
- [ ] Version-check endpoint reading from a config table or environment

When all boxes are ticked and `redocly lint docs/openapi.yaml` validates against the actual responses, the backend is ready for mobile to wire up.
