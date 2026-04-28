/**
 * Subset of API types the app uses today. Mirrors the shapes in
 * `docs/openapi.yaml`. Will be regenerated via openapi-typescript
 * once the backend is reachable; for now hand-rolled to match.
 */

export type QuotationStatus =
  | 'draft' | 'open' | 'accepted' | 'declined' | 'expired' | 'converted';

export type LineItem = {
  description:      string;
  quantity:         number;
  unit_price_minor: number;
  tax_code:         string | null;
  line_total_minor: number;
};

export type ContactRef = {
  id:    string;
  name:  string;
  email: string;
};

export type LinkedInvoiceRef = {
  id:  string;
  ref: string;
};

/** Used by the list — only the columns the row needs. */
export type QuotationSummary = {
  id:           string;
  ref:          string;
  status:       QuotationStatus;
  issue_date:   string;
  expires_at:   string;
  contact_name: string;
  total_minor:  number;
  currency:     string;
};

/** Used by the detail — the full GET /v1/quotations/{id} shape. */
export type Quotation = QuotationSummary & {
  delivery_days:        number | null;
  contact:              ContactRef;
  subtotal_minor:       number;
  tax_minor:            number;
  line_items:           LineItem[];
  terms_and_conditions: string | null;
  remarks:              string | null;
  internal_remarks:     string | null;
  linked_invoice:       LinkedInvoiceRef | null;
  share_url:            string;
  can_update?:          boolean;
  can_delete?:          boolean;
};

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue';

export type ResourcePermissions = {
  create: boolean;
  update: boolean;
  delete: boolean;
};
