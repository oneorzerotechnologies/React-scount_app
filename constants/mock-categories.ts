import type { ExpenseCategory, IncomeCategory } from '@/types/api';

export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'ec_office',   name: 'Office supplies',     code: '6100' },
  { id: 'ec_travel',   name: 'Travel & transport',  code: '6200' },
  { id: 'ec_meals',    name: 'Meals & entertainment', code: '6300' },
  { id: 'ec_utility',  name: 'Utilities',           code: '6400' },
  { id: 'ec_software', name: 'Software & SaaS',     code: '6500' },
  { id: 'ec_pro',      name: 'Professional fees',   code: '6600' },
  { id: 'ec_market',   name: 'Marketing & ads',     code: '6700' },
];

export const MOCK_INCOME_CATEGORIES: IncomeCategory[] = [
  { id: 'ic_interest', name: 'Interest income',     code: '4400' },
  { id: 'ic_refund',   name: 'Refund / rebate',     code: '4500' },
  { id: 'ic_other',    name: 'Other income',        code: '4900' },
  { id: 'ic_grant',    name: 'Grant / subsidy',     code: '4600' },
];
