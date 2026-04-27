import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewQuotationScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.close, { color: palette.text }]}>×</Text>
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>New quote</Text>
        <Text style={[styles.save, { color: moss[700] }]}>Save</Text>
      </View>

      <View style={styles.placeholder}>
        <View style={styles.dot} />
        <Text style={[styles.step, { color: moss[700] }]}>05C · CREATE</Text>
        <Text style={[styles.heading, { color: palette.text }]}>Five fields, two taps</Text>
        <Text style={[styles.body, { color: palette.textMuted }]}>
          Create form lands here next — contact picker, dates, delivery,
          line items, terms, remarks. Form spec in mockups/quotation.html.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  close: { fontSize: 24, lineHeight: 24 },
  title: { fontSize: 16, fontWeight: '800' },
  save:  { fontSize: 13, fontWeight: '700' },

  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dot: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: moss[500], marginBottom: 16,
    shadowColor: moss[700], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 18,
  },
  step:    { fontFamily: 'ui-monospace', fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  heading: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  body:    { marginTop: 8, fontSize: 12, textAlign: 'center', maxWidth: 280, lineHeight: 18 },
});
