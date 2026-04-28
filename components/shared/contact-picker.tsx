import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Contact, ContactType } from '@/types/api';

/**
 * Bottom-sheet contact picker. Used by Quotation create/edit and
 * Invoice create/edit. v0 just lists everything filtered by type;
 * search + cursor pagination land in Phase 2.
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
      <View style={styles.root}>
        {/* Tap-anywhere-outside-the-sheet to dismiss */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>Pick a contact</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: palette.textMuted, fontSize: 22, lineHeight: 22 }}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {items.length === 0 && (
              <Text style={[styles.empty, { color: palette.textMuted }]}>
                No {filter === 'supplier' ? 'suppliers' : 'clients'} yet.
              </Text>
            )}

            {items.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => onSelect(c)}
                style={({ pressed }) => [
                  styles.row,
                  { borderBottomColor: palette.border },
                  pressed && { backgroundColor: palette.surfaceMuted },
                ]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{c.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={[styles.sub, { color: palette.textMuted }]} numberOfLines={1}>
                    {c.email ?? c.phone ?? c.type.toUpperCase()}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={palette.textMuted as string} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Modal root: column layout, backdrop above, sheet pinned to bottom.
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 6,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginVertical: 8,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  title: { fontSize: 14, fontWeight: '800' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: moss[500],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  name: { fontSize: 14, fontWeight: '700' },
  sub:  { fontSize: 11, marginTop: 1 },

  empty: { padding: 24, fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
});
