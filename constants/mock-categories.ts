import type { ChartAccount, TaxRate } from '@/types/api';

/**
 * Expense-side chart of accounts — the dropdown on the expense form's
 * "Expense Account" field.
 */
export const MOCK_EXPENSE_ACCOUNTS: ChartAccount[] = [
  { id: 'ca_cogs',     code: '5000', name: 'Cost of Goods Sold',     type: 'expense' },
  { id: 'ca_office',   code: '6100', name: 'Office Supplies',         type: 'expense' },
  { id: 'ca_travel',   code: '6200', name: 'Travel & Transport',      type: 'expense' },
  { id: 'ca_meals',    code: '6300', name: 'Meals & Entertainment',   type: 'expense' },
  { id: 'ca_utility',  code: '6400', name: 'Utilities',               type: 'expense' },
  { id: 'ca_software', code: '6500', name: 'Software & SaaS',         type: 'expense' },
  { id: 'ca_pro',      code: '6600', name: 'Professional Fees',       type: 'expense' },
  { id: 'ca_market',   code: '6700', name: 'Marketing & Advertising', type: 'expense' },
  { id: 'ca_bank',     code: '6800', name: 'Bank Charges',            type: 'expense' },
];

/**
 * Income-side chart of accounts — the dropdown on the income form's
 * "Income Account" field.
 */
export const MOCK_INCOME_ACCOUNTS: ChartAccount[] = [
  { id: 'ia_sales',    code: '4000', name: 'Sales Revenue',           type: 'income' },
  { id: 'ia_service',  code: '4100', name: 'Service Revenue',         type: 'income' },
  { id: 'ia_interest', code: '4400', name: 'Interest Income',         type: 'income' },
  { id: 'ia_refund',   code: '4500', name: 'Refund / Rebate',         type: 'income' },
  { id: 'ia_grant',    code: '4600', name: 'Grant / Subsidy',         type: 'income' },
  { id: 'ia_other',    code: '4900', name: 'Other Income',            type: 'income' },
];

/**
 * Tax rates — mirrors the rows on /accounting/taxes. SST 6% is the
 * common Malaysian default; 0% / Zero-Rated covers exempt sales.
 */
export const MOCK_TAX_RATES: TaxRate[] = [
  { id: 'tx_sst6',  display_name: 'SST 6%',         rate: 6, type: 'percentage' },
  { id: 'tx_sst8',  display_name: 'SST 8% (services)', rate: 8, type: 'percentage' },
  { id: 'tx_zero',  display_name: 'Zero-Rated',     rate: 0, type: 'percentage' },
];
