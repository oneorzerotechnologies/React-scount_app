import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusPill } from '@/components/ui/status-pill';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { daysFromToday, formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { InvoiceSummary } from '@/types/api';

const RED_TINT_BG = '#FEF2F2';
const RED_TINT_BORDER = '#FECACA';
const RED_TEXT = '#B91C1C';

export function InvoiceListItem({
  invoice,
  onPress,
}: {
  invoice: InvoiceSummary;
  onPress?: () => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  const isOverdue = invoice.status === 'overdue';
  const isPaid    = invoice.status === 'paid';

  // Mockup: overdue rows are red-tinted; paid rows show "Paid <date>" sub-line.
  let subline: string;
  let sublineStyle = {};
  if (isOverdue) {
    const days = -daysFromToday(invoice.due_date);
    subline = `Overdue ${days} day${days === 1 ? '' : 's'}`;
    sublineStyle = { color: RED_TEXT, fontWeight: '700' as const };
  } else if (isPaid) {
    subline = `Paid · ${formatDateShort(invoice.due_date)}`;
    sublineStyle = { color: palette.textMuted };
  } else if (invoice.status === 'draft') {
    subline = 'Draft';
    sublineStyle = { color: palette.textMuted };
  } else {
    subline = `Issued ${formatDateShort(invoice.issue_date)} · Due ${formatDateShort(invoice.due_date)}`;
    sublineStyle = { color: palette.textMuted };
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isOverdue ? RED_TINT_BG : palette.surface,
          borderColor:     isOverdue ? RED_TINT_BORDER : palette.border,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.refRow}>
          <StatusPill status={invoice.status} />
          <Text style={[styles.ref, { color: palette.textMuted }]}>{invoice.ref}</Text>
        </View>
        <Text
          style={[
            styles.amount,
            { color: invoice.status === 'draft' ? palette.textMuted : palette.text },
          ]}
        >
          {formatMoneyCompact(invoice.total_minor, invoice.currency)}
        </Text>
      </View>

      <Text
        style={[
          styles.contact,
          { color: invoice.status === 'draft' ? palette.textMuted : palette.text },
        ]}
        numberOfLines={1}
      >
        {invoice.contact_name}
      </Text>

      <Text style={[styles.subline, sublineStyle]}>{subline}</Text>
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
