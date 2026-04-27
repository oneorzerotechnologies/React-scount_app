import type { QuotationSummary } from '@/types/api';

/**
 * Hand-authored fixtures matching mockups/quotation.html so the screen
 * renders something believable before the backend is up. Will be
 * replaced by `useQuotationList()` against /v1/quotations once the
 * Sanctum auth + axios client land.
 */
export const MOCK_QUOTATIONS: QuotationSummary[] = [
  {
    id:           'qt_038',
    ref:          'QT-038',
    status:       'open',
    issue_date:   '2026-04-25',
    expires_at:   '2026-05-25',
    contact_name: 'CityWorks Sdn Bhd',
    total_minor:  872000,
    currency:     'MYR',
  },
  {
    id:           'qt_037',
    ref:          'QT-037',
    status:       'open',
    issue_date:   '2026-04-22',
    expires_at:   '2026-05-22',
    contact_name: 'Borneo Coffee Co.',
    total_minor:  2460000,
    currency:     'MYR',
  },
  {
    id:           'qt_036',
    ref:          'QT-036',
    status:       'accepted',
    issue_date:   '2026-04-22',
    expires_at:   '2026-05-22',
    contact_name: 'PT Anugerah',
    total_minor:  1240000,
    currency:     'MYR',
  },
  {
    id:           'qt_034',
    ref:          'QT-034',
    status:       'declined',
    issue_date:   '2026-04-12',
    expires_at:   '2026-05-12',
    contact_name: 'Pesisir Marine',
    total_minor:  680000,
    currency:     'MYR',
  },
  {
    id:           'qt_031',
    ref:          'QT-031',
    status:       'expired',
    issue_date:   '2026-03-15',
    expires_at:   '2026-04-15',
    contact_name: 'Acme Sdn Bhd',
    total_minor:  520000,
    currency:     'MYR',
  },
];
