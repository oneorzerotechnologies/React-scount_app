/**
 * Subset of API types the app uses today. Mirrors the shapes in
 * `docs/openapi.yaml`. Will be regenerated via openapi-typescript
 * once the backend is reachable; for now hand-rolled to match.
 */

export type QuotationStatus = 'draft' | 'open' | 'accepted' | 'declined' | 'expired' | 'converted';

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

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue';

export type ResourcePermissions = {
  create: boolean;
  update: boolean;
  delete: boolean;
};
