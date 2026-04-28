import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaymentsBlock } from '@/components/invoice/payments-block';
import { UpcomingCyclesCard } from '@/components/invoice/upcoming-cycles-card';
import { AdditionalInfoCard } from '@/components/shared/additional-info-card';
import { TotalCard } from '@/components/shared/total-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatusPill } from '@/components/ui/status-pill';
import { Colors, moss, slate } from '@/constants/theme';
import { MOCK_INVOICES } from '@/constants/mock-invoices';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoney, formatMoneyCompact } from '@/lib/money';

const RED_TINT = '#FEF2F2';
const RED_BORDER = '#FECACA';
const RED_TEXT = '#B91C1C';

export default function InvoiceDetailScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();

  const inv = MOCK_INVOICES.find((i) => i.id === id);

  if (!inv) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: palette.textMuted }]}>Invoice not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPaid    = inv.status === 'paid';
  const isOverdue = inv.status === 'overdue';
  const isReadOnly = isPaid; // paid invoices can't be edited

  const onShare = async () => {
    try {
      await Share.share({ url: inv.share_url, message: `${inv.ref} · ${inv.contact.name}` });
    } catch { /* cancelled */ }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={20} color={palette.text} />
        </Pressable>
        <Text style={[styles.headerRef, { color: palette.text }]}>{inv.ref}</Text>
        <View style={styles.headerRight}>
          {!isReadOnly && (
            <Pressable
              onPress={() => router.push('/(tabs)/invoices/new')}
              hitSlop={6}
              style={styles.iconBtn}
            >
              <IconSymbol name="pencil" size={18} color={moss[700]} />
            </Pressable>
          )}
          <Pressable hitSlop={6} style={styles.iconBtn}>
            <IconSymbol name="ellipsis" size={20} color={palette.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status badge */}
        <View style={styles.statusRow}>
          <StatusPill
            status={inv.status}
            style={[
              styles.bigStatus,
              isOverdue && { backgroundColor: '#FEE2E2' },
            ]}
            textStyle={styles.bigStatusText}
          />
          {isOverdue && (
            <Text style={[styles.overdueDays, { color: RED_TEXT }]}>· 4 days late</Text>
          )}
        </View>

        {/* Lineage pills */}
        {(inv.from_quotation || inv.recurrence) && (
          <View style={styles.pillsRow}>
            {inv.from_quotation && (
              <View style={[styles.lineagePill, { backgroundColor: palette.surfaceMuted }]}>
                <Text style={[styles.lineageText, { color: palette.textMuted }]}>
                  From {inv.from_quotation.ref} <Text style={{ color: moss[700] }}>→</Text>
                </Text>
              </View>
            )}
            {inv.recurrence && (
              <View style={styles.recurringPill}>
                <Text style={styles.recurringPillText}>
                  ⟳  Recurring · {inv.recurrence.frequency}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Contact */}
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactAvatarText}>{inv.contact.name[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactName, { color: palette.text }]} numberOfLines={1}>
              {inv.contact.name}
            </Text>
            <Text style={[styles.contactEmail, { color: palette.textMuted }]} numberOfLines={1}>
              {inv.contact.email}
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={slate[400]} />
        </View>

        {/* Total */}
        <View style={{ marginTop: 8 }}>
          <TotalCard
            total_minor={inv.total_minor}
            subtotal_minor={inv.subtotal_minor}
            tax_minor={inv.tax_minor}
            currency={inv.currency}
            taxEnabled
            label="Total"
            footnote={`Due ${formatDateShort(inv.due_date)} · Paid ${formatMoney(inv.paid_minor, inv.currency)} of ${formatMoney(inv.total_minor, inv.currency)}`}
          />
        </View>

        {/* Payments block */}
        <View style={{ marginTop: 8 }}>
          <PaymentsBlock payments={inv.payments} currency={inv.currency} />
        </View>

        {/* Upcoming cycles */}
        {inv.recurrence && (
          <View style={{ marginTop: 8 }}>
            <UpcomingCyclesCard recurrence={inv.recurrence} />
          </View>
        )}

        {/* Line items */}
        <View style={[styles.card, styles.lineItems, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {inv.line_items.map((li, i) => (
            <View
              key={`${li.name}-${i}`}
              style={[
                styles.lineRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.lineName, { color: palette.text }]} numberOfLines={1}>
                  {li.name}
                </Text>
                {li.description && (
                  <Text style={[styles.lineDesc, { color: palette.textMuted }]} numberOfLines={2}>
                    {li.description}
                  </Text>
                )}
                <Text style={[styles.lineMeta, { color: palette.textMuted }]}>
                  {li.quantity} × {formatMoneyCompact(li.unit_price_minor, inv.currency)}
                </Text>
              </View>
              <Text style={[styles.lineAmount, { color: palette.text }]}>
                {formatMoneyCompact(li.line_total_minor, inv.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <DateChip label="Issued"   value={formatDateShort(inv.issue_date)} palette={palette} />
          <DateChip
            label="Due"
            value={formatDateShort(inv.due_date)}
            palette={palette}
            tint={isOverdue ? { bg: RED_TINT, border: RED_BORDER, fg: RED_TEXT } : undefined}
          />
          {inv.delivery_days != null && (
            <DateChip label="Delivery" value={`${inv.delivery_days} days`} palette={palette} />
          )}
        </View>

        {/* Additional info */}
        <View style={{ marginTop: 8 }}>
          <AdditionalInfoCard
            terms={inv.terms_and_conditions}
            remarks={inv.remarks}
            internal={inv.internal_remarks}
          />
        </View>
      </ScrollView>

      {/* Action bar — Share only on v1 (no record-payment, no reminders) */}
      <View style={[styles.actionBar, { backgroundColor: palette.surface, borderTopColor: palette.border }]}>
        <Pressable
          onPress={onShare}
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
        >
          <IconSymbol name="square.and.arrow.up" size={14} color="#fff" />
          <Text style={styles.primaryText}>Share</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function DateChip({
  label, value, palette, tint,
}: {
  label: string;
  value: string;
  palette: typeof Colors.light | typeof Colors.dark;
  tint?: { bg: string; border: string; fg: string };
}) {
  return (
    <View
      style={[
        styles.dateChip,
        {
          backgroundColor: tint?.bg ?? palette.surface,
          borderColor:     tint?.border ?? palette.border,
        },
      ]}
    >
      <Text style={[styles.dateLabel, { color: tint?.fg ?? palette.textMuted }]}>
        {label.toUpperCase()}
      </Text>
      <Text style={[styles.dateValue, { color: tint?.fg ?? palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, paddingBottom: 24, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 13 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  iconBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  headerRef:  { fontSize: 14, fontWeight: '700', fontFamily: 'ui-monospace' },
  headerRight:{ flexDirection: 'row' },

  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  bigStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  bigStatusText: { fontSize: 10, letterSpacing: 1.2 },
  overdueDays: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },

  pillsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 6 },
  lineagePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  lineageText: { fontSize: 10, fontFamily: 'ui-monospace' },
  recurringPill: { backgroundColor: moss[100], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  recurringPillText: { color: moss[700], fontSize: 10, fontWeight: '700', fontFamily: 'ui-monospace' },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, padding: 12,
    marginTop: 8,
  },
  contactAvatar: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: moss[500],
    alignItems: 'center', justifyContent: 'center',
  },
  contactAvatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  contactName:       { fontSize: 13, fontWeight: '700' },
  contactEmail:      { fontSize: 11, marginTop: 1 },

  lineItems: { flexDirection: 'column', alignItems: 'stretch', padding: 0 },
  lineRow:   { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 10 },
  lineName:  { fontSize: 13, fontWeight: '700' },
  lineDesc:  { fontSize: 11, marginTop: 1 },
  lineMeta:  { fontSize: 10, marginTop: 2 },
  lineAmount:{ fontSize: 13, fontWeight: '700', marginLeft: 8 },

  datesRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dateChip: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  dateLabel:{ fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  dateValue:{ fontSize: 13, fontWeight: '700', marginTop: 2 },

  actionBar: {
    paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primary: {
    backgroundColor: moss[500],
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
