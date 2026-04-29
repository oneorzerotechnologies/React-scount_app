import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ContactPerson } from '@/types/api';

/**
 * Inline editor for a contact's persons[]. Each row exposes name +
 * email + phone fields and a delete button; tap "Add person" to push
 * a new empty row. Mirrors the web `client_contacts` repeater on the
 * accounting/contacts edit form.
 */
export function PersonEditor({
  persons,
  onChange,
}: {
  persons:  ContactPerson[];
  onChange: (next: ContactPerson[]) => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  const update = (idx: number, patch: Partial<ContactPerson>) => {
    const next = persons.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(persons.filter((_, i) => i !== idx));
  };

  const add = () => {
    const id = `p_new_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    onChange([...persons, { id, name: '', email: null, phone: null }]);
  };

  return (
    <View>
      <View style={styles.list}>
        {persons.map((p, i) => (
          <View
            key={p.id}
            style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={styles.headRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {p.name.length > 0 ? p.name[0].toUpperCase() : '?'}
                </Text>
              </View>
              <TextInput
                value={p.name}
                onChangeText={(v) => update(i, { name: v })}
                placeholder="Person name *"
                placeholderTextColor={slate[400]}
                style={[styles.nameInput, { color: palette.text }]}
              />
              <Pressable onPress={() => remove(i)} hitSlop={8} style={styles.removeBtn}>
                <Text style={{ color: slate[400], fontSize: 18, lineHeight: 18 }}>×</Text>
              </Pressable>
            </View>

            <TextInput
              value={p.email ?? ''}
              onChangeText={(v) => update(i, { email: v.length > 0 ? v : null })}
              placeholder="email@example.com"
              placeholderTextColor={slate[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.subInput, { color: palette.text, borderColor: palette.border }]}
            />
            <TextInput
              value={p.phone ?? ''}
              onChangeText={(v) => update(i, { phone: v.length > 0 ? v : null })}
              placeholder="+60 …"
              placeholderTextColor={slate[400]}
              keyboardType="phone-pad"
              style={[styles.subInput, { color: palette.text, borderColor: palette.border }]}
            />
          </View>
        ))}
      </View>

      <Pressable
        onPress={add}
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
      >
        <IconSymbol name="plus" size={12} color={moss[700]} />
        <Text style={[styles.addBtnText, { color: moss[700] }]}>Add person</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    gap: 6,
  },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: moss[500],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  nameInput:  { flex: 1, fontSize: 14, fontWeight: '700', paddingVertical: 0 },
  removeBtn:  { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },

  subInput: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 12,
  },

  addBtn: {
    marginTop: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: moss[200],
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  addBtnText: { fontSize: 12, fontWeight: '700' },
});
