import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdditionalInfoCard } from '@/components/shared/additional-info-card';
import { TotalCard } from '@/components/shared/total-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatusPill } from '@/components/ui/status-pill';
import { Colors, moss, slate } from '@/constants/theme';
import { MOCK_QUOTATIONS } from '@/constants/mock-quotations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';

export default function QuotationDetailScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();

  const quote = MOCK_QUOTATIONS.find((q) => q.id === id);

  if (!quote) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: palette.textMuted }]}>Quote not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAccepted = quote.status === 'accepted';
  const isReadOnly = quote.status === 'expired' || quote.status === 'converted';

  const onShare = async () => {
    try {
      await Share.share({ url: quote.share_url, message: `${quote.ref} · ${quote.contact.name}` });
    } catch {
      /* user cancelled — silent */
    }
  };

  const onConvert = () => {
    // Real wire-up calls POST /v1/quotations/{id}/convert-to-invoice and routes
    // to the new invoice's detail. For v0, just log + return.
    // eslint-disable-next-line no-console
    console.log('Convert', quote.id, '→ POST /v1/quotations/{id}/convert-to-invoice');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={20} color={palette.text} />
        </Pressable>

        <Text style={[styles.headerRef, { color: palette.text }]}>{quote.ref}</Text>

        <View style={styles.headerRight}>
          {!isReadOnly && (
            <Pressable
              onPress={() => router.push('/(tabs)/quotations/new')}
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
          <StatusPill status={quote.status} style={styles.bigStatus} textStyle={styles.bigStatusText} />
        </View>

        {/* Contact card */}
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactAvatarText}>{quote.contact.name[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactName, { color: palette.text }]} numberOfLines={1}>
              {quote.contact.name}
            </Text>
            <Text style={[styles.contactEmail, { color: palette.textMuted }]} numberOfLines={1}>
              {quote.contact.email}
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={slate[400]} />
        </View>

        {/* Total card */}
        <View style={{ marginTop: 8 }}>
          <TotalCard
            total_minor={quote.total_minor}
            subtotal_minor={quote.subtotal_minor}
            tax_minor={quote.tax_minor}
            currency={quote.currency}
            taxEnabled
            label="Total"
          />
        </View>

        {/* Line items */}
        <View style={[styles.card, styles.lineItems, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {quote.line_items.map((li, i) => (
            <View
              key={`${li.description}-${i}`}
              style={[
                styles.lineRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.lineDesc, { color: palette.text }]} numberOfLines={1}>
                  {li.description}
                </Text>
                <Text style={[styles.lineMeta, { color: palette.textMuted }]}>
                  {li.quantity} × {formatMoneyCompact(li.unit_price_minor, quote.currency)}
                  {li.tax_code && ` · ${li.tax_code === 'SST6' ? 'SST 6%' : li.tax_code}`}
                </Text>
              </View>
              <Text style={[styles.lineAmount, { color: palette.text }]}>
                {formatMoneyCompact(li.line_total_minor, quote.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Dates + delivery */}
        <View style={styles.datesRow}>
          <DateChip label="Issued"   value={formatDateShort(quote.issue_date)} palette={palette} />
          <DateChip label="Expires"  value={formatDateShort(quote.expires_at)} palette={palette} />
          {quote.delivery_days != null && (
            <DateChip label="Delivery" value={`${quote.delivery_days} days`} palette={palette} />
          )}
        </View>

        {/* Additional information */}
        <View style={{ marginTop: 8 }}>
          <AdditionalInfoCard
            terms={quote.terms_and_conditions}
            remarks={quote.remarks}
            internal={quote.internal_remarks}
          />
        </View>

        {/* Linked invoice (if converted) */}
        {quote.linked_invoice && (
          <Pressable
            onPress={() => router.push(`/(tabs)/invoices`)}
            style={[styles.linkedCard, { borderColor: palette.border, backgroundColor: palette.surface }]}
          >
            <Text style={[styles.linkedLabel, { color: palette.textMuted }]}>CONVERTED TO</Text>
            <Text style={[styles.linkedRef, { color: moss[700] }]}>
              {quote.linked_invoice.ref} →
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Action bar */}
      <View style={[styles.actionBar, { backgroundColor: palette.surface, borderTopColor: palette.border }]}>
        {isAccepted ? (
          <View style={styles.acceptedRow}>
            <Pressable
              onPress={onConvert}
              style={({ pressed }) => [styles.primary, styles.primaryWide, pressed && { opacity: 0.85 }]}
            >
              <IconSymbol name="arrow.right" size={14} color="#fff" />
              <Text style={styles.primaryText}>Convert to invoice</Text>
            </Pressable>
            <Pressable
              onPress={onShare}
              style={({ pressed }) => [
                styles.secondary,
                { borderColor: palette.border, backgroundColor: palette.surface },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="square.and.arrow.up" size={14} color={palette.text} />
              <Text style={[styles.secondaryText, { color: palette.text }]}>Share</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onShare}
            style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
          >
            <IconSymbol name="square.and.arrow.up" size={14} color="#fff" />
            <Text style={styles.primaryText}>Share</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function DateChip({
  label, value, palette,
}: {
  label: string;
  value: string;
  palette: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={[styles.dateChip, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.dateLabel, { color: palette.textMuted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.dateValue, { color: palette.text }]}>{value}</Text>
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

  statusRow:    { alignItems: 'center', marginTop: 0 },
  bigStatus:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  bigStatusText:{ fontSize: 10, letterSpacing: 1.2 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
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
  lineRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  lineDesc:  { fontSize: 12, fontWeight: '600' },
  lineMeta:  { fontSize: 10, marginTop: 1 },
  lineAmount:{ fontSize: 13, fontWeight: '700', marginLeft: 8 },

  datesRow:  { flexDirection: 'row', gap: 8, marginTop: 8 },
  dateChip:  { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  dateLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  dateValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },

  linkedCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkedLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  linkedRef:   { fontSize: 13, fontWeight: '700', marginTop: 2 },

  actionBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  acceptedRow: { flexDirection: 'row', gap: 8 },
  primary: {
    flex: 1,
    backgroundColor: moss[500],
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: moss[700],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  primaryWide: { flexBasis: '66%' },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  secondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryText: { fontSize: 13, fontWeight: '600' },
});
