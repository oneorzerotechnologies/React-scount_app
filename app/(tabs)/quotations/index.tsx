import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuotationListItem } from '@/components/quotation/quotation-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterPills, type FilterPillOption } from '@/components/ui/filter-pills';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { MOCK_QUOTATIONS } from '@/constants/mock-quotations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { QuotationStatus } from '@/types/api';

type Filter = 'all' | Exclude<QuotationStatus, 'draft'>;

export default function QuotationListScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const [filter, setFilter] = useState<Filter>('open');

  // Counts feed the pill labels — mockup pattern is "Open · 12".
  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: MOCK_QUOTATIONS.length, open: 0, accepted: 0, declined: 0, expired: 0, converted: 0,
    };
    for (const q of MOCK_QUOTATIONS) {
      if (q.status in c) c[q.status as Filter]++;
    }
    return c;
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? MOCK_QUOTATIONS : MOCK_QUOTATIONS.filter((q) => q.status === filter)),
    [filter],
  );

  const filterOptions: FilterPillOption<Filter>[] = [
    { value: 'all',       label: 'All' },
    { value: 'open',      label: 'Open',      count: counts.open },
    { value: 'accepted',  label: 'Accepted',  count: counts.accepted },
    { value: 'declined',  label: 'Declined',  count: counts.declined },
    { value: 'expired',   label: 'Expired' },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.text }]}>Quotations</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/quotations/new')}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        <FilterPills options={filterOptions} value={filter} onChange={setFilter} />
      </View>

      {/* Search (visual placeholder for now) */}
      <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={slate[400]} />
        <Text style={[styles.searchPlaceholder, { color: palette.textMuted }]}>
          Search ref, contact, amount
        </Text>
      </View>

      {/* List */}
      {visible.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="doc.text.fill"
            headline="Nothing here yet"
            body="No quotations match the current filter. Try Open, or create a new quote."
            ctaLabel="New quote"
            onCtaPress={() => router.push('/(tabs)/quotations/new')}
          />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(q) => q.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <QuotationListItem
              quote={item}
              onPress={() => router.push(`/(tabs)/quotations/${item.id}`)}
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

  filterRow: { paddingHorizontal: 16 },

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
