import { StyleSheet, Text, View } from 'react-native';

import { moss } from '@/constants/theme';
import { formatMoney } from '@/lib/money';

/**
 * The big gradient hero card used on Quotation + Invoice detail
 * screens. Subtotal/Tax/Total breakdown — Tax row hides when
 * tax is disabled at the workspace level.
 */
export function TotalCard({
  total_minor,
  subtotal_minor,
  tax_minor,
  currency,
  taxEnabled = true,
  label = 'Total',
  footnote,
}: {
  total_minor:    number;
  subtotal_minor: number;
  tax_minor:      number;
  currency:       string;
  taxEnabled?:    boolean;
  label?:         string;
  footnote?:      string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{label.toUpperCase()}</Text>
      <Text style={styles.amount}>{formatMoney(total_minor, currency)}</Text>

      <View style={styles.breakdown}>
        <Text style={styles.breakdownText}>
          Subtotal {formatMoney(subtotal_minor, currency)}
        </Text>
        {taxEnabled && (
          <Text style={styles.breakdownText}>
            Tax {formatMoney(tax_minor, currency)}
          </Text>
        )}
      </View>

      {footnote && <Text style={styles.footnote}>{footnote}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: moss[600],
    borderRadius: 16,
    padding: 14,
    shadowColor: moss[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  eyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  amount:  { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  breakdown: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  breakdownText: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  footnote: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4 },
});
