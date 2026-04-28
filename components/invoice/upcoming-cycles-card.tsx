import { StyleSheet, Text, View } from 'react-native';

import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateFull } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { Recurrence } from '@/types/api';

/**
 * "Upcoming cycles" card for recurring invoices. Mirrors the web
 * /accounting/invoices/<id> view. Mobile is read-only — cadence and
 * end date are configured on web.
 */
export function UpcomingCyclesCard({ recurrence }: { recurrence: Recurrence }) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: palette.textMuted }]}>UPCOMING CYCLES</Text>
        <View style={styles.webBadge}>
          <Text style={styles.webBadgeText}>WEB ONLY</Text>
        </View>
      </View>

      <View style={{ gap: 4, marginTop: 6 }}>
        {recurrence.upcoming_cycles.map((c, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.leftCol}>
              {i === 0 && (
                <View style={styles.nextBadge}>
                  <Text style={styles.nextBadgeText}>NEXT</Text>
                </View>
              )}
              <Text style={[styles.date, i === 0 ? { color: palette.text } : { color: palette.textMuted }]}>
                {formatDateFull(c.issue_date)}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                { color: i === 0 ? palette.text : palette.textMuted },
              ]}
            >
              {formatMoneyCompact(c.amount_minor, c.currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  webBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  webBadgeText: { color: '#475569', fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },

  row: { flexDirection: 'row', alignItems: 'center' },
  leftCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextBadge: { backgroundColor: moss[100], paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  nextBadgeText: { color: moss[700], fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },
  date: { fontSize: 11, fontWeight: '600' },
  amount: { fontSize: 12, fontWeight: '700' },
});
