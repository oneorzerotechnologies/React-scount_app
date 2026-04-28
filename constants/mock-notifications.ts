import type { AppNotification } from '@/types/api';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id:          'n_1',
    category:    'invoice_paid',
    title:       'Invoice paid',
    body:        'PT Anugerah paid INV-482 · RM 12,400',
    occurred_at: '2026-04-27T07:30:00Z',
    read:        false,
    href:        '/(tabs)/invoices/inv_482',
  },
  {
    id:          'n_2',
    category:    'quote_accepted',
    title:       'Quote accepted',
    body:        'PT Anugerah accepted QT-036 · ready to invoice',
    occurred_at: '2026-04-27T04:30:00Z',
    read:        false,
    href:        '/(tabs)/quotations/qt_036',
  },
  {
    id:          'n_3',
    category:    'invoice_overdue',
    title:       'Invoice overdue',
    body:        'Borneo Coffee · INV-478 · 4 days late',
    occurred_at: '2026-04-27T01:30:00Z',
    read:        false,
    href:        '/(tabs)/invoices/inv_478',
  },
  {
    id:          'n_4',
    category:    'quote_viewed',
    title:       'Quote viewed',
    body:        'CityWorks opened QT-038',
    occurred_at: '2026-04-25T10:00:00Z',
    read:        true,
    href:        '/(tabs)/quotations/qt_038',
  },
  {
    id:          'n_5',
    category:    'weekly_digest',
    title:       'Weekly digest',
    body:        'RM 156k collected · 12 quotes sent · 3 new clients',
    occurred_at: '2026-04-24T13:00:00Z',
    read:        true,
  },
];
