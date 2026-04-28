/**
 * Subset of API types the app uses today. Mirrors the shapes in
 * `docs/openapi.yaml`. Will be regenerated via openapi-typescript
 * once the backend is reachable; for now hand-rolled to match.
 */

export type QuotationStatus =
  | 'draft' | 'open' | 'accepted' | 'declined' | 'expired' | 'converted';

export type LineItem = {
  /** Short item name — primary visual on list rows. */
  name:             string;
  /** Optional longer description — wraps below the name on the PDF. */
  description:      string | null;
  quantity:         number;
  unit_price_minor: number;
  /** Tax code, e.g. 'SST6', or null when this line is tax-exempt. */
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

export type ContactType = 'client' | 'supplier';

export type Contact = {
  id:                 string;
  type:               ContactType;
  name:               string;
  email:              string | null;
  phone:              string | null;
  tax_id:             string | null;
  address_line1:      string | null;
  address_city:       string | null;
  outstanding_minor:  number;
  invoice_count:      number;
  quote_count:        number;
  currency:           string;
  notes:              string | null;
};

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue';

export type Payment = {
  id:           string;
  amount_minor: number;
  currency:     string;
  method:       string;
  recorded_at:  string;
  reference:    string | null;
};

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type UpcomingCycle = {
  issue_date:   string;
  amount_minor: number;
  currency:     string;
};

export type GeneratedCycle = {
  id:           string;
  ref:          string;
  issue_date:   string;
  total_minor:  number;
  currency:     string;
  status:       InvoiceStatus;
  sent_at:      string | null;
};

export type Recurrence = {
  enabled:           boolean;
  frequency:         RecurrenceFrequency;
  anchor_day:        number;
  next_at:           string;
  ends_at:           string | null;
  upcoming_cycles:   UpcomingCycle[];
  generated_cycles:  GeneratedCycle[];
};

export type FromQuotationRef = {
  id:  string;
  ref: string;
};

export type InvoiceSummary = {
  id:           string;
  ref:          string;
  status:       InvoiceStatus;
  issue_date:   string;
  due_date:     string;
  contact_name: string;
  total_minor:  number;
  paid_minor:   number;
  currency:     string;
};

export type Invoice = InvoiceSummary & {
  delivery_days:        number | null;
  contact:              ContactRef;
  subtotal_minor:       number;
  tax_minor:            number;
  line_items:           LineItem[];
  payments:             Payment[];
  terms_and_conditions: string | null;
  remarks:              string | null;
  internal_remarks:     string | null;
  recurrence:           Recurrence | null;
  from_quotation:       FromQuotationRef | null;
  share_url:            string;
  can_update?:          boolean;
  can_delete?:          boolean;
};

export type NotificationCategory =
  | 'quote_accepted' | 'quote_viewed' | 'invoice_paid' | 'invoice_overdue' | 'weekly_digest';

export type AppNotification = {
  id:          string;
  category:    NotificationCategory;
  title:       string;
  body:        string;
  occurred_at: string;
  read:        boolean;
  /** Path to deep-link to on tap. */
  href?:       string;
};

export type ResourcePermissions = {
  create: boolean;
  update: boolean;
  delete: boolean;
};
