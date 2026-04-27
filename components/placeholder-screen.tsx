import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  title: string;
  subtitle: string;
  step: string;
};

export function PlaceholderScreen({ title, subtitle, step }: Props) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.center}>
        <View style={styles.dot} />
        <Text style={[styles.step, { color: moss[700] }]}>{step}</Text>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dot: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: moss[500],
    marginBottom: 16,
    shadowColor: moss[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  step:     { fontFamily: 'ui-monospace', fontSize: 11, letterSpacing: 1.5, marginBottom: 4 },
  title:    { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { marginTop: 8, fontSize: 12, textAlign: 'center', maxWidth: 260, lineHeight: 18 },
});
