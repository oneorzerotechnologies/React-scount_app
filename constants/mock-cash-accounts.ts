import type { CashAccount } from '@/types/api';

/**
 * Cash, bank, credit card and e-wallet accounts surfaced in the
 * "Paid From" picker on expense forms. Mirrors the web grouping.
 */
export const MOCK_CASH_ACCOUNTS: CashAccount[] = [
  { id: 'a_cash',    name: 'Cash on hand',          group: 'Cash',        issuer: null,         code: '1000' },
  { id: 'a_petty',   name: 'Petty cash',            group: 'Cash',        issuer: null,         code: '1010' },
  { id: 'a_mbb',     name: 'Maybank Current 5142',  group: 'Bank',        issuer: 'Maybank',    code: '1100' },
  { id: 'a_cimb',    name: 'CIMB Current 7008',     group: 'Bank',        issuer: 'CIMB',       code: '1110' },
  { id: 'a_alli_cc', name: 'Alliance Bank Card',    group: 'Credit Card', issuer: 'Alliance',   code: '2500' },
  { id: 'a_tng',     name: 'Touch n Go eWallet',    group: 'E-Wallet',    issuer: 'TNG',        code: '1200' },
];
