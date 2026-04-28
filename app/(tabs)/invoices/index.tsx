import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InvoiceListItem } from '@/components/invoice/invoice-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterPills, type FilterPillOption } from '@/components/ui/filter-pills';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { MOCK_INVOICES } from '@/constants/mock-invoices';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { InvoiceStatus } from '@/types/api';

type Filter = 'all' | InvoiceStatus;

export default function InvoiceListScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: MOCK_INVOICES.length, draft: 0, sent: 0, paid: 0, overdue: 0, partially_paid: 0,
    };
    for (const inv of MOCK_INVOICES) c[inv.status]++;
    return c;
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? MOCK_INVOICES : MOCK_INVOICES.filter((i) => i.status === filter)),
    [filter],
  );

  const filterOptions: FilterPillOption<Filter>[] = [
    { value: 'all',     label: 'All' },
    { value: 'draft',   label: 'Draft',   count: counts.draft },
    { value: 'sent',    label: 'Sent',    count: counts.sent },
    { value: 'paid',    label: 'Paid',    count: counts.paid },
    { value: 'overdue', label: 'Overdue', count: counts.overdue },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.text }]}>Invoices</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/invoices/new')}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <FilterPills options={filterOptions} value={filter} onChange={setFilter} />
      </View>

      <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={slate[400]} />
        <Text style={[styles.searchPlaceholder, { color: palette.textMuted }]}>
          Search ref, contact, amount
        </Text>
      </View>

      {visible.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="list.bullet.rectangle.fill"
            headline="No invoices match"
            body="Try a different filter, or create a new invoice from a quote."
            ctaLabel="New invoice"
            onCtaPress={() => router.push('/(tabs)/invoices/new')}
          />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <InvoiceListItem
              invoice={item}
              onPress={() => router.push(`/(tabs)/invoices/${item.id}`)}
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
