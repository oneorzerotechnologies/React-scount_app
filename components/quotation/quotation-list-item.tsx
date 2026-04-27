import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusPill } from '@/components/ui/status-pill';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { QuotationSummary } from '@/types/api';

export function QuotationListItem({
  quote,
  onPress,
}: {
  quote: QuotationSummary;
  onPress?: () => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  // Mockup convention: ACCEPTED rows get a "Ready to invoice →" hint
  // instead of the Issued/Expires line.
  const subline =
    quote.status === 'accepted'
      ? 'Ready to invoice →'
      : `Issued ${formatDateShort(quote.issue_date)} · Expires ${formatDateShort(quote.expires_at)}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.surface, borderColor: palette.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.refRow}>
          <StatusPill status={quote.status} />
          <Text style={[styles.ref, { color: palette.textMuted }]}>{quote.ref}</Text>
        </View>
        <Text
          style={[
            styles.amount,
            { color: quote.status === 'expired' ? palette.textMuted : palette.text },
          ]}
        >
          {formatMoneyCompact(quote.total_minor, quote.currency)}
        </Text>
      </View>

      <Text
        style={[
          styles.contact,
          { color: quote.status === 'expired' ? palette.textMuted : palette.text },
        ]}
        numberOfLines={1}
      >
        {quote.contact_name}
      </Text>

      <Text
        style={[
          styles.subline,
          quote.status === 'accepted' && { color: moss[700], fontWeight: '600' },
          quote.status !== 'accepted' && { color: palette.textMuted },
        ]}
      >
        {subline}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  topRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  refRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ref:     { fontSize: 11, fontFamily: 'ui-monospace' },
  amount:  { fontSize: 14, fontWeight: '700' },
  contact: { marginTop: 2, fontSize: 13, fontWeight: '500' },
  subline: { marginTop: 2, fontSize: 11 },
});
