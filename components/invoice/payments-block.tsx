import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import type { Payment } from '@/types/api';

/**
 * Read-only payments list. Mobile never has a "Record payment"
 * affordance — recording happens on web only. The block carries a
 * "Web only" badge so users know where to act.
 */
export function PaymentsBlock({
  payments,
  currency,
}: {
  payments: Payment[];
  currency: string;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: palette.textMuted }]}>PAYMENTS</Text>
        <View style={styles.webBadge}>
          <Text style={styles.webBadgeText}>WEB ONLY</Text>
        </View>
      </View>

      {payments.length === 0 ? (
        <Text style={[styles.empty, { color: palette.textMuted }]}>
          No payments yet · record on scount.my
        </Text>
      ) : (
        <View style={{ gap: 4 }}>
          {payments.map((p) => (
            <View key={p.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.method, { color: palette.text }]} numberOfLines={1}>
                  {p.method}
                </Text>
                <Text style={[styles.meta,   { color: palette.textMuted }]} numberOfLines={1}>
                  {formatDateShort(p.recorded_at)}
                  {p.reference && ` · ${p.reference}`}
                </Text>
              </View>
              <Text style={[styles.amount, { color: palette.text }]}>
                {formatMoney(p.amount_minor, currency)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  webBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  webBadgeText: { color: '#475569', fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },

  empty: { marginTop: 6, fontSize: 11, fontStyle: 'italic' },

  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  method: { fontSize: 12, fontWeight: '600' },
  meta:   { fontSize: 10, marginTop: 1 },
  amount: { fontSize: 13, fontWeight: '700' },
});
