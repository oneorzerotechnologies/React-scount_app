import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { daysFromToday, formatDateFull, formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { GeneratedCycle, Recurrence } from '@/types/api';

/**
 * Recurring-invoice billing block. Mirrors the web flow on
 * /accounting/invoices/<id>:
 *   • Header: cadence, generated count, next date, optional Generate Now
 *   • Generated cycles list (children) with sent-at indicator
 *   • Unsent warning banner when any child has not been marked sent
 *   • Upcoming cycles pills (NEXT / OVERDUE / future) projected forward
 * Cadence + end-date themselves remain web-only configuration.
 */
export function UpcomingCyclesCard({ recurrence }: { recurrence: Recurrence }) {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const generated = recurrence.generated_cycles ?? [];
  const upcoming  = recurrence.upcoming_cycles;
  const isDueNow  = daysFromToday(recurrence.next_at) <= 0;
  const unsent    = generated.filter((c) => c.sent_at == null).length;

  const onGenerate = () => {
    Alert.alert(
      'Generate next cycle?',
      `${formatDateFull(recurrence.next_at)} · ${formatMoneyCompact(upcoming[0]?.amount_minor ?? 0, upcoming[0]?.currency ?? 'MYR')} will post to AR + Revenue.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            // eslint-disable-next-line no-console
            console.log('Generate cycle', recurrence.next_at, '→ POST /v1/invoices/recurring/{id}/generate');
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: palette.textMuted }]}>BILLING HISTORY</Text>
          <Text style={[styles.cadence, { color: palette.text }]}>
            {capitalize(recurrence.frequency)}
            {' · '}
            <Text style={{ color: palette.textMuted, fontWeight: '500' }}>
              {generated.length} generated
            </Text>
          </Text>
        </View>
        {isDueNow && (
          <Pressable
            onPress={onGenerate}
            style={({ pressed }) => [styles.generateBtn, pressed && { opacity: 0.85 }]}
          >
            <IconSymbol name="bolt.fill" size={11} color="#fff" />
            <Text style={styles.generateBtnText}>Generate Now</Text>
          </Pressable>
        )}
      </View>

      {generated.length === 0 ? (
        <Text style={[styles.empty, { color: palette.textMuted }]}>
          No recurring invoices generated yet.
        </Text>
      ) : (
        <View style={styles.children}>
          {generated.map((c) => (
            <ChildRow
              key={c.id}
              cycle={c}
              frequency={recurrence.frequency}
              onPress={() => router.push(`/(tabs)/sales/invoices/${c.id}`)}
              palette={palette}
            />
          ))}
        </View>
      )}

      {unsent > 0 && (
        <View style={styles.unsentBanner}>
          <Text style={styles.unsentText}>
            <Text style={{ fontWeight: '800' }}>{unsent}</Text>
            {' generated '}
            {unsent > 1 ? "invoices haven't" : "invoice hasn't"}
            {' been marked sent. Open each one and tap Mark as Sent.'}
          </Text>
        </View>
      )}

      {upcoming.length > 0 && (
        <View style={styles.upcomingBlock}>
          <Text style={[styles.upcomingLabel, { color: palette.textMuted }]}>
            UPCOMING CYCLES
          </Text>
          <View style={styles.pillRow}>
            {upcoming.map((u, i) => {
              const overdue = daysFromToday(u.issue_date) <= 0;
              const isNext  = i === 0 && !overdue;
              return (
                <View
                  key={i}
                  style={[
                    styles.pill,
                    overdue ? styles.pillOverdue : isNext ? styles.pillNext : styles.pillFuture,
                  ]}
                >
                  {isNext && <Text style={styles.pillBadge}>NEXT</Text>}
                  {overdue && <Text style={[styles.pillBadge, styles.pillBadgeRed]}>OVERDUE</Text>}
                  <Text
                    style={[
                      styles.pillDate,
                      overdue ? styles.pillDateRed : isNext ? styles.pillDateAmber : { color: palette.textMuted },
                    ]}
                  >
                    {formatDateShort(u.issue_date)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

function ChildRow({
  cycle, frequency, onPress, palette,
}: {
  cycle:     GeneratedCycle;
  frequency: Recurrence['frequency'];
  onPress:   () => void;
  palette:   typeof Colors.light | typeof Colors.dark;
}) {
  const cycleLabel = frequency === 'yearly'
    ? cycle.issue_date.slice(0, 4)
    : monthYearShort(cycle.issue_date);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.childRow,
        { borderColor: palette.border, backgroundColor: cycle.sent_at ? palette.surface : '#FFFBEB' },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.childCycle}>
        <Text style={[styles.childCycleText, { color: palette.text }]}>{cycleLabel}</Text>
        <Text style={[styles.childRef, { color: moss[700] }]}>{cycle.ref}</Text>
      </View>
      <View style={styles.childStatus}>
        {cycle.sent_at ? (
          <View style={styles.sentBadge}>
            <Text style={styles.sentBadgeText}>SENT {formatDateShort(cycle.sent_at)}</Text>
          </View>
        ) : (
          <View style={styles.unsentBadge}>
            <Text style={styles.unsentBadgeText}>NOT SENT</Text>
          </View>
        )}
      </View>
      <Text style={[styles.childAmount, { color: palette.text }]}>
        {formatMoneyCompact(cycle.total_minor, cycle.currency)}
      </Text>
    </Pressable>
  );
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function monthYearShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  cadence: { fontSize: 12, fontWeight: '700', marginTop: 1 },

  generateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#D97706', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  generateBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  empty: { fontSize: 12, fontStyle: 'italic', marginTop: 8 },

  children: { marginTop: 8, gap: 4 },
  childRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  childCycle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  childCycleText: { fontSize: 11, fontWeight: '700' },
  childRef: { fontSize: 11, fontWeight: '700' },
  childStatus: {},
  sentBadge: {
    backgroundColor: '#DBEAFE', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3,
  },
  sentBadgeText: { color: '#1D4ED8', fontSize: 7, fontWeight: '800', letterSpacing: 0.4, fontFamily: 'ui-monospace' },
  unsentBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3,
  },
  unsentBadgeText: { color: '#B45309', fontSize: 7, fontWeight: '800', letterSpacing: 0.4, fontFamily: 'ui-monospace' },
  childAmount: { fontSize: 12, fontWeight: '800' },

  unsentBanner: {
    marginTop: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1, borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 8,
  },
  unsentText: { color: '#92400E', fontSize: 11 },

  upcomingBlock: { marginTop: 10, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: slate[100] },
  upcomingLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  pillNext:    { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  pillOverdue: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  pillFuture:  { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  pillBadge: {
    fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace',
    color: '#B45309',
  },
  pillBadgeRed: { color: '#B91C1C' },
  pillDate:      { fontSize: 11, fontWeight: '700' },
  pillDateAmber: { color: '#92400E' },
  pillDateRed:   { color: '#991B1B' },
});
