/**
 * Money helpers. Every monetary value in the app is `amount_minor`
 * (integer cents) + `currency` (ISO 4217). Never floats.
 *
 * `formatMoney` is the single place those touch screen — components
 * pass the raw integer + code, we return a localised display string.
 */

const formatters = new Map<string, Intl.NumberFormat>();

const fmtFor = (currency: string, locale: string, opts: Intl.NumberFormatOptions) => {
  const key = `${locale}:${currency}:${JSON.stringify(opts)}`;
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.NumberFormat(locale, { style: 'currency', currency, ...opts }),
    );
  }
  return formatters.get(key)!;
};

/** "RM 12,400.00" */
export function formatMoney(amount_minor: number, currency: string, locale = 'en-MY') {
  return fmtFor(currency, locale, { minimumFractionDigits: 2 }).format(amount_minor / 100);
}

/** "RM 12,400" — no decimals. Use on dense list rows where two decimals is noise. */
export function formatMoneyCompact(amount_minor: number, currency: string, locale = 'en-MY') {
  return fmtFor(currency, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    Math.round(amount_minor / 100),
  );
}
