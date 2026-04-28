import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactListItem } from '@/components/contact/contact-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Colors, moss, slate } from '@/constants/theme';
import { MOCK_CONTACTS } from '@/constants/mock-contacts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ContactType } from '@/types/api';

export default function ContactsListScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const [segment, setSegment] = useState<ContactType>('client');

  const visible = useMemo(
    () => MOCK_CONTACTS.filter((c) => c.type === segment),
    [segment],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.text }]}>Contacts</Text>
        <Pressable
          onPress={() => router.push({ pathname: '/(tabs)/contacts/new', params: { type: segment } })}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.segmentWrap}>
        <SegmentedControl
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'client',   label: 'Clients' },
            { value: 'supplier', label: 'Suppliers' },
          ]}
        />
      </View>

      <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={slate[400]} />
        <Text style={[styles.searchPlaceholder, { color: palette.textMuted }]}>
          Search {segment === 'client' ? 'clients' : 'suppliers'}
        </Text>
      </View>

      {visible.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="person.2.fill"
            headline={segment === 'client' ? 'No clients yet' : 'No suppliers yet'}
            body={segment === 'client'
              ? 'Add a client to start invoicing.'
              : 'Track who you owe and what you’ve spent (Phase 2 features unlock as you add).'}
            ctaLabel={`New ${segment}`}
            onCtaPress={() => router.push({ pathname: '/(tabs)/contacts/new', params: { type: segment } })}
          />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <ContactListItem
              contact={item}
              onPress={() => router.push(`/(tabs)/contacts/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
  },
  title:  { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: moss[500],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10,
  },

  segmentWrap: { paddingHorizontal: 16, marginTop: 4 },

  search: {
    marginHorizontal: 16, marginTop: 10, marginBottom: 6,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  searchPlaceholder: { fontSize: 13 },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  emptyWrap:   { flex: 1, justifyContent: 'center' },
});
