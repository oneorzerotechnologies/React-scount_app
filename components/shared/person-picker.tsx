import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ContactPerson } from '@/types/api';

/**
 * Bottom-sheet picker for the optional contact person within a client.
 * Mirrors the web `client_contact_id` field on quotation/invoice forms.
 */
export function PersonPicker({
  visible,
  persons,
  contactName,
  onSelect,
  onClear,
  onClose,
}: {
  visible:     boolean;
  persons:     ContactPerson[];
  contactName: string;
  onSelect:    (person: ContactPerson) => void;
  onClear:     () => void;
  onClose:     () => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: palette.text }]}>Pick contact person</Text>
              <Text style={[styles.subtitle, { color: palette.textMuted }]} numberOfLines={1}>
                {contactName}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: palette.textMuted, fontSize: 22, lineHeight: 22 }}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
            <Pressable
              onPress={onClear}
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: palette.border },
                pressed && { backgroundColor: palette.surfaceMuted },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: palette.border }]}>
                <Text style={[styles.avatarText, { color: palette.textMuted }]}>—</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: palette.text }]}>No contact person</Text>
                <Text style={[styles.sub, { color: palette.textMuted }]}>Send to the company default email</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={palette.textMuted as string} />
            </Pressable>

            {persons.length === 0 ? (
              <Text style={[styles.empty, { color: palette.textMuted }]}>
                No people on file for this client. Add one in the contact record.
              </Text>
            ) : (
              persons.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => onSelect(p)}
                  style={({ pressed }) => [
                    styles.row,
                    { borderBottomColor: palette.border },
                    pressed && { backgroundColor: palette.surfaceMuted },
                  ]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{p.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: palette.text }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.sub, { color: palette.textMuted }]} numberOfLines={1}>
                      {p.email ?? p.phone ?? 'No contact info'}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={palette.textMuted as string} />
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 6, paddingBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16,
  },
  handle: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#cbd5e1', marginVertical: 8,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  title:    { fontSize: 14, fontWeight: '800' },
  subtitle: { fontSize: 11, marginTop: 1 },

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
