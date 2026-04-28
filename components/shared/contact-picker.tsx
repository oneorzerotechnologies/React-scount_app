import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Contact, ContactType } from '@/types/api';

/**
 * Simple bottom-sheet contact picker. Used by Quotation create/edit
 * and Invoice create/edit. Real version (Phase 2) gets search +
 * cursor pagination; v0 just lists everything filtered by type.
 */
export function ContactPicker({
  visible,
  contacts,
  filter,
  onSelect,
  onClose,
}: {
  visible:  boolean;
  contacts: Contact[];
  filter?:  ContactType;
  onSelect: (contact: Contact) => void;
  onClose:  () => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];
  const items = filter ? contacts.filter((c) => c.type === filter) : contacts;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>Pick a contact</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ color: palette.textMuted, fontSize: 18, lineHeight: 18 }}>×</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {items.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => onSelect(c)}
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: palette.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{c.name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>{c.name}</Text>
                <Text style={[styles.sub,  { color: palette.textMuted }]} numberOfLines={1}>
                  {c.email ?? c.phone ?? c.type.toUpperCase()}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={palette.textMuted as string} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    maxHeight: '70%',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 6,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', marginVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  title:  { fontSize: 14, fontWeight: '700' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: { width: 36, height: 36, borderRadius: 8, backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  name: { fontSize: 13, fontWeight: '700' },
  sub:  { fontSize: 11, marginTop: 1 },
});
