import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_INCOMES } from '@/constants/mock-incomes';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateFull } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';

export default function IncomeDetailScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();

  const inc = MOCK_INCOMES.find((x) => x.id === id);

  if (!inc) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: palette.textMuted }]}>Income not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const onShare = async () => {
    try {
      await Share.share({ url: inc.share_url, message: `${inc.ref} · ${inc.account.name}` });
    } catch { /* cancelled */ }
  };

  const onDownload = () => {
    // eslint-disable-next-line no-console
    console.log('Download PDF', inc.id);
    Alert.alert('Saving PDF', `${inc.ref}.pdf will appear in Files once download completes.`);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace('/(tabs)/purchase')}
          hitSlop={20}
          style={styles.iconBtn}
        >
          <IconSymbol name="chevron.left" size={20} color={palette.text} />
        </Pressable>
        <Text style={[styles.headerRef, { color: palette.text }]}>{inc.ref}</Text>
        <View style={styles.headerRight}>
          <Pressable hitSlop={6} style={styles.iconBtn}>
            <IconSymbol name="pencil" size={18} color={moss[700]} />
          </Pressable>
          <Pressable hitSlop={6} style={styles.iconBtn}>
            <IconSymbol name="ellipsis" size={20} color={palette.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>INCOME · {inc.currency}</Text>
          <Text style={styles.heroAmount}>+{formatMoneyCompact(inc.total_minor, inc.currency)}</Text>
          <Text style={styles.heroSub}>
            Subtotal {formatMoneyCompact(inc.amount_minor, inc.currency)}
            {inc.tax_minor > 0 && ` · Tax ${formatMoneyCompact(inc.tax_minor, inc.currency)}`}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <KV label="Date"     value={formatDateFull(inc.date)} palette={palette} />
          {inc.category && <KV label="Category" value={inc.category} palette={palette} divider />}
          <KV label="Account"  value={`${inc.account.code} — ${inc.account.name}`} palette={palette} divider />
          <KV label="Method"   value={inc.payment_option} palette={palette} divider />
          {inc.contact && <KV label="From" value={inc.contact.name} palette={palette} divider />}
          {inc.tax_rate && (
            <KV label="Tax" value={`${inc.tax_rate.display_name} · ${formatMoneyCompact(inc.tax_minor, inc.currency)}`} palette={palette} divider />
          )}
          {inc.description && <KV label="Note" value={inc.description} palette={palette} divider />}
        </View>

        {inc.internal_remark && (
          <View style={styles.privateCard}>
            <View style={styles.privateHeader}>
              <Text style={styles.privateEyebrow}>INTERNAL REMARK</Text>
              <View style={styles.privateBadge}><Text style={styles.privateBadgeText}>PDF-HIDDEN</Text></View>
            </View>
            <Text style={[styles.privateBody, { color: palette.text }]}>{inc.internal_remark}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.metaLabel, { color: palette.textMuted }]}>RECONCILED</Text>
            <Text style={[styles.metaValue, { color: inc.reconciled ? moss[700] : '#C2410C' }]}>
              {inc.reconciled ? 'YES' : 'NO'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsBlock}>
          <View style={styles.actionRow}>
            <Pressable
              onPress={onShare}
              style={({ pressed }) => [styles.primary, styles.actionFlex, pressed && { opacity: 0.85 }]}
            >
              <IconSymbol name="square.and.arrow.up" size={14} color="#fff" />
              <Text style={styles.primaryText}>Share</Text>
            </Pressable>
            <Pressable
              onPress={onDownload}
              style={({ pressed }) => [
                styles.secondary, styles.actionFlex,
                { borderColor: palette.border, backgroundColor: palette.surface },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="arrow.down.doc" size={14} color={palette.text} />
              <Text style={[styles.secondaryText, { color: palette.text }]}>Download PDF</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function KV({
  label, value, palette, divider,
}: {
  label: string;
  value: string;
  palette: typeof Colors.light | typeof Colors.dark;
  divider?: boolean;
}) {
  return (
    <View
      style={[
        styles.kvRow,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
      ]}
    >
      <Text style={[styles.kvLabel, { color: palette.textMuted }]}>{label}</Text>
      <Text style={[styles.kvValue, { color: palette.text }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { padding: 16, paddingBottom: 24, gap: 8 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound:{ fontSize: 13 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  iconBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  headerRef:  { fontSize: 14, fontWeight: '700', fontFamily: 'ui-monospace' },
  headerRight:{ flexDirection: 'row' },

  heroCard: {
    backgroundColor: moss[600], borderRadius: 16, padding: 14,
    shadowColor: moss[900], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24,
  },
  heroEyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  heroAmount:  { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  heroSub:     { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4 },

  card: { borderWidth: 1, borderRadius: 12 },
  kvRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  kvLabel:{ width: 80, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  kvValue:{ flex: 1, fontSize: 12, fontWeight: '600' },

  privateCard:   { backgroundColor: 'rgba(254,243,199,0.4)', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, padding: 12, marginTop: 8 },
  privateHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  privateEyebrow:{ color: '#B45309', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  privateBadge:  { backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  privateBadgeText: { color: '#B45309', fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },
  privateBody:   { fontSize: 12, fontStyle: 'italic', marginTop: 2 },

  metaRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  metaChip:  { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 110 },
  metaLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  metaValue: { fontSize: 12, fontWeight: '800', marginTop: 1, fontFamily: 'ui-monospace' },

  actionsBlock: { marginTop: 16 },
  actionRow:    { flexDirection: 'row', gap: 8 },
  actionFlex:   { flex: 1 },
  primary: {
    backgroundColor: moss[500], borderRadius: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondary: {
    borderWidth: 1, borderRadius: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  secondaryText: { fontSize: 13, fontWeight: '600' },
});
