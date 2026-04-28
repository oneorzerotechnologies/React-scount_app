import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * iOS-style segmented control. Used by Contacts list (Clients/Suppliers)
 * and Contact create (type picker).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options:  { value: T; label: string }[];
  value:    T;
  onChange: (v: T) => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.track, { backgroundColor: palette.surfaceMuted }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.segment,
              active && [styles.segmentActive, { backgroundColor: palette.surface }],
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? palette.text : palette.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Variant where active segment is moss-filled with white text. Used on Contact create. */
export function SegmentedControlPrimary<T extends string>({
  options,
  value,
  onChange,
}: {
  options:  { value: T; label: string }[];
  value:    T;
  onChange: (v: T) => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={[styles.track, { backgroundColor: palette.surfaceMuted }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.segment,
              active && { backgroundColor: moss[500] },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? '#fff' : palette.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  label: { fontSize: 13, fontWeight: '700' },
});
