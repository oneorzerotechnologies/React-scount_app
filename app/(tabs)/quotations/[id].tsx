import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MOCK_QUOTATIONS } from '@/constants/mock-quotations';

export default function QuotationDetailScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();

  const quote = MOCK_QUOTATIONS.find((q) => q.id === id);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={palette.text} />
        </Pressable>
        <Text style={[styles.headerRef, { color: palette.text }]}>{quote?.ref ?? '—'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.placeholder}>
        <View style={styles.dot} />
        <Text style={[styles.step, { color: moss[700] }]}>05B · DETAIL</Text>
        <Text style={[styles.title, { color: palette.text }]}>
          {quote ? `${quote.contact_name}` : 'Quote not found'}
        </Text>
        <Text style={[styles.body, { color: palette.textMuted }]}>
          Detail spec is in mockups/quotation.html and docs/UI-DESIGN.md §5B.
          Wires up next: contact card, total, line items, additional info,
          action bar (Convert / Share for ACCEPTED).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  backBtn:   { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  headerRef: { fontSize: 14, fontWeight: '700', fontFamily: 'ui-monospace' },

  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dot: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: moss[500], marginBottom: 16,
    shadowColor: moss[700], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 18,
  },
  step:  { fontFamily: 'ui-monospace', fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center' },
  body:  { marginTop: 8, fontSize: 12, textAlign: 'center', maxWidth: 280, lineHeight: 18 },
});
