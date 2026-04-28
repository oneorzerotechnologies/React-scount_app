import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Workspace switcher + bell row */}
        <View style={styles.headerRow}>
          <View style={styles.workspacePill}>
            <View style={styles.workspaceAvatar}>
              <Text style={styles.workspaceAvatarText}>A</Text>
            </View>
            <Text style={[styles.workspaceName, { color: palette.text }]}>Acme Sdn Bhd</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => router.push('/(tabs)/more/notifications')}
              hitSlop={6}
              style={styles.bellBtn}
            >
              <IconSymbol name="ellipsis" size={16} color={palette.text} />
              <View style={styles.bellDot} />
            </Pressable>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>E</Text>
            </View>
          </View>
        </View>

        {/* Greeting */}
        <Text style={[styles.eyebrow, { color: palette.textMuted }]}>GOOD MORNING</Text>
        <Text style={[styles.greeting, { color: palette.text }]}>Eva</Text>

        {/* Hero — You're owed */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>YOU&apos;RE OWED</Text>
          <Text style={styles.heroAmount}>RM 47,800</Text>
          <Text style={styles.heroSub}>8 unpaid invoices · 3 due this week</Text>
        </View>

        {/* 2-up: open quotes / overdue */}
        <View style={styles.twoUp}>
          <View style={[styles.kpi, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>OPEN QUOTES</Text>
            <Text style={[styles.kpiValue, { color: palette.text }]}>12</Text>
            <Text style={[styles.kpiSub, { color: palette.textMuted }]}>RM 84.2k pipeline</Text>
          </View>
          <View style={styles.kpiAmber}>
            <Text style={styles.kpiLabelAmber}>OVERDUE</Text>
            <Text style={[styles.kpiValue, { color: '#0F172A' }]}>3</Text>
            <Text style={styles.kpiSubAmber}>RM 18.4k · chase up</Text>
          </View>
        </View>

        {/* Phase-1 caption */}
        <Text style={[styles.placeholder, { color: palette.textMuted }]}>
          Phase 1 boot · live data wires up next.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { padding: 16, paddingBottom: 32 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workspacePill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  workspaceAvatar: { width: 24, height: 24, borderRadius: 6, backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  workspaceAvatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  workspaceName: { fontSize: 13, fontWeight: '600' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute', top: 6, right: 6,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: moss[500],
  },

  profileAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  eyebrow: { marginTop: 16, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  greeting: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },

  hero: {
    marginTop: 16,
    backgroundColor: moss[600],
    borderRadius: 16,
    padding: 16,
    shadowColor: moss[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  heroEyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  heroAmount:  { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  heroSub:     { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4 },

  twoUp: { flexDirection: 'row', gap: 8, marginTop: 12 },
  kpi:      { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1 },
  kpiAmber: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  kpiLabel:      { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  kpiLabelAmber: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: '#B45309' },
  kpiValue:      { fontSize: 20, fontWeight: '800', marginTop: 4 },
  kpiSub:        { fontSize: 10, marginTop: 2 },
  kpiSubAmber:   { fontSize: 10, marginTop: 2, color: '#B45309' },

  placeholder: { marginTop: 24, fontSize: 11, textAlign: 'center', fontStyle: 'italic' },
});
