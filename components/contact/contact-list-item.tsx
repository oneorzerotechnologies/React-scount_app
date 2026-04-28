import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMoneyCompact } from '@/lib/money';
import type { Contact } from '@/types/api';

const RED_TEXT = '#B91C1C';

// Deterministic pastel-ish avatar gradient from the contact id.
const AVATAR_PALETTES = [
  [moss[300], moss[600]],
  ['#FCD34D', '#D97706'],
  ['#7DD3FC', '#0284C7'],
  ['#F0ABFC', '#A21CAF'],
  ['#FCA5A5', '#B91C1C'],
];

function paletteFor(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  const p = AVATAR_PALETTES[idx];
  return [p[0], p[1]];
}

export function ContactListItem({
  contact,
  onPress,
}: {
  contact: Contact;
  onPress?: () => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];
  const [, end] = paletteFor(contact.id);

  // Sub-line copy depends on type and outstanding balance.
  let sub: string;
  let subStyle = {};
  if (contact.type === 'client') {
    if (contact.outstanding_minor > 0) {
      sub = `${contact.invoice_count} invoice${contact.invoice_count === 1 ? '' : 's'} · ${formatMoneyCompact(contact.outstanding_minor, contact.currency)} outstanding`;
    } else if (contact.invoice_count > 0) {
      sub = 'All paid up';
    } else if (contact.quote_count > 0) {
      sub = `${contact.quote_count} quote${contact.quote_count === 1 ? '' : 's'} in pipeline`;
    } else {
      sub = 'No activity yet';
    }
  } else {
    sub = contact.notes ?? 'Supplier · bills land in Phase 2';
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.surface, borderColor: palette.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: end }]}>
        <Text style={styles.avatarText}>{contact.name[0].toUpperCase()}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>{contact.name}</Text>
        <Text
          style={[
            styles.sub,
            sub.includes('outstanding') ? { color: RED_TEXT } : { color: palette.textMuted },
            subStyle,
          ]}
          numberOfLines={1}
        >
          {sub}
        </Text>
      </View>

      <IconSymbol name="chevron.right" size={14} color={palette.textMuted as string} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  name: { fontSize: 13, fontWeight: '700' },
  sub:  { fontSize: 11, marginTop: 1 },
});
