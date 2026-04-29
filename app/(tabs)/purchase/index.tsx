import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { SegmentedControlPrimary } from '@/components/ui/segmented-control';
import { MOCK_EXPENSES } from '@/constants/mock-expenses';
import { MOCK_INCOMES } from '@/constants/mock-incomes';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { Expense, IncomeEntry } from '@/types/api';

type Segment = 'payments' | 'income';

export default function PurchaseScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const [segment, setSegment] = useState<Segment>('payments');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.text }]}>Purchase</Text>
        <Pressable
          onPress={() =>
            router.push(
              segment === 'payments'
                ? '/(tabs)/purchase/payments/new'
                : '/(tabs)/purchase/income/new',
            )
          }
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.segment}>
        <SegmentedControlPrimary
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'payments', label: 'Payments' },
            { value: 'income',   label: 'Income' },
          ]}
        />
      </View>

      <View style={[styles.search, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={slate[400]} />
        <Text style={[styles.searchPlaceholder, { color: palette.textMuted }]}>
          Search ref, category, amount
        </Text>
      </View>

      {segment === 'payments' ? (
        <FlatList
          data={MOCK_EXPENSES}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <ExpenseRow
              expense={item}
              palette={palette}
              onPress={() => router.push(`/(tabs)/purchase/payments/${item.id}`)}
            />
          )}
        />
      ) : (
        <FlatList
          data={MOCK_INCOMES}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <IncomeRow
              income={item}
              palette={palette}
              onPress={() => router.push(`/(tabs)/purchase/income/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function ExpenseRow({
  expense, palette, onPress,
}: {
  expense: Expense;
  palette: typeof Colors.light | typeof Colors.dark;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.surface, borderColor: palette.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.rowHead}>
          {!expense.reconciled && (
            <View style={styles.unrecBadge}><Text style={styles.unrecText}>UNREC</Text></View>
          )}
          <Text style={[styles.rowRef, { color: palette.textMuted }]}>{expense.ref}</Text>
        </View>
        <Text style={[styles.rowName, { color: palette.text }]} numberOfLines={1}>
          {expense.category ?? expense.account.name}
        </Text>
        <Text style={[styles.rowMeta, { color: palette.textMuted }]} numberOfLines={1}>
          {formatDateShort(expense.date)} · {expense.account.name}
          {expense.paid_from && ` · ${expense.paid_from.name}`}
        </Text>
      </View>
      <Text style={[styles.rowAmount, { color: palette.text }]}>
        {formatMoneyCompact(expense.total_minor, expense.currency)}
      </Text>
    </Pressable>
  );
}

function IncomeRow({
  income, palette, onPress,
}: {
  income:  IncomeEntry;
  palette: typeof Colors.light | typeof Colors.dark;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.surface, borderColor: palette.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.rowHead}>
          {!income.reconciled && (
            <View style={styles.unrecBadge}><Text style={styles.unrecText}>UNREC</Text></View>
          )}
          <Text style={[styles.rowRef, { color: palette.textMuted }]}>{income.ref}</Text>
        </View>
        <Text style={[styles.rowName, { color: palette.text }]} numberOfLines={1}>
          {income.category ?? income.account.name}
        </Text>
        <Text style={[styles.rowMeta, { color: palette.textMuted }]} numberOfLines={1}>
          {formatDateShort(income.date)} · {income.account.name}
        </Text>
      </View>
      <Text style={[styles.rowAmount, { color: moss[700] }]}>
        +{formatMoneyCompact(income.total_minor, income.currency)}
      </Text>
    </Pressable>
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

  segment: { paddingHorizontal: 16, marginTop: 4, marginBottom: 8 },

  search: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 6,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  searchPlaceholder: { fontSize: 13 },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  rowHead:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowRef:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, fontFamily: 'ui-monospace' },
  rowName:   { fontSize: 13, fontWeight: '700', marginTop: 2 },
  rowMeta:   { fontSize: 11, marginTop: 2 },
  rowAmount: { fontSize: 14, fontWeight: '800' },

  unrecBadge: { backgroundColor: '#FFEDD5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  unrecText:  { color: '#C2410C', fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },
});
