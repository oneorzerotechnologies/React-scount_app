import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SPLASH_HOLD_MS = 5000;

export default function Splash() {
  const router  = useRouter();
  const palette = Colors[useColorScheme() ?? 'light'];

  // Three pulsing dots — staggered fade
  const dots = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, { toValue: 1,   duration: 480, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 480, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());

    // Auto-route after the brand hold. v0: always to login (no real token check yet).
    const t = setTimeout(() => router.replace('/(auth)/login'), SPLASH_HOLD_MS);

    return () => {
      loops.forEach((l) => l.stop());
      clearTimeout(t);
    };
    // One-shot effect — `router` and `dots` (a ref) are stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top', 'bottom']}>
      <View style={styles.center}>
        {/* Brand mark */}
        <View style={styles.brandPill}>
          <Text style={styles.brandGlyph}>$</Text>
        </View>

        {/* Wordmark */}
        <Text style={[styles.wordmark, { color: palette.text }]}>
          scount<Text style={{ color: moss[600] }}>.my</Text>
        </Text>
        <Text style={[styles.tagline, { color: palette.textMuted }]}>Run the books, anywhere.</Text>
      </View>

      {/* Pulsing dots */}
      <View style={styles.dots}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  brandPill: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: moss[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: moss[700],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  brandGlyph: { color: '#fff', fontSize: 44, fontWeight: '800', marginTop: -4 },

  wordmark: { marginTop: 24, fontSize: 32, fontWeight: '800', letterSpacing: -0.6 },
  tagline:  { marginTop: 8, fontSize: 14 },

  dots: { flexDirection: 'row', gap: 8, alignSelf: 'center', marginBottom: 40 },
  dot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: moss[400] },
});
