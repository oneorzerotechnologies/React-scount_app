import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Reusable empty-state block. Same pattern across Quotations, Invoices,
 * Contacts, Notifications, search results — see UI-DESIGN.md §09A.
 */
export function EmptyState({
  icon,
  headline,
  body,
  ctaLabel,
  onCtaPress,
  secondaryLabel,
  onSecondaryPress,
  style,
}: {
  icon: Parameters<typeof IconSymbol>[0]['name'];
  headline: string;
  body: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  style?: ViewStyle;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.root, style]}>
      <View style={styles.iconBox}>
        <IconSymbol name={icon} size={36} color={moss[600]} />
      </View>
      <Text style={[styles.headline, { color: palette.text }]}>{headline}</Text>
      <Text style={[styles.body, { color: palette.textMuted }]}>{body}</Text>

      {ctaLabel && (
        <Pressable
          onPress={onCtaPress}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      )}

      {secondaryLabel && (
        <Pressable
          onPress={onSecondaryPress}
          style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.secondaryText, { color: moss[700] }]}>{secondaryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: moss[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: { marginTop: 14, fontSize: 16, fontWeight: '800' },
  body:     { marginTop: 6, fontSize: 12, textAlign: 'center', maxWidth: 260, lineHeight: 18 },
  cta: {
    marginTop: 16,
    backgroundColor: moss[500],
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  ctaText:        { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondary:      { marginTop: 8, padding: 6 },
  secondaryText:  { fontSize: 11, fontWeight: '600' },
});
