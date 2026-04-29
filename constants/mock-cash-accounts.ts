import type { CashAccount } from '@/types/api';

export const MOCK_CASH_ACCOUNTS: CashAccount[] = [
  { id: 'a_cash',  name: 'Cash on hand',          type: 'cash' },
  { id: 'a_mbb',   name: 'Maybank Current 5142',  type: 'bank' },
  { id: 'a_cimb',  name: 'CIMB Current 7008',     type: 'bank' },
];
