import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type FilterPillOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

/**
 * Horizontal scrollable row of pill filters. Used by Quotation list,
 * Invoice list, Notifications inbox, etc. Active pill = moss bg,
 * inactive = slate-100 bg.
 */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.pill,
              active
                ? styles.pillActive
                : { backgroundColor: palette.surfaceMuted },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? '#fff' : palette.textMuted },
              ]}
            >
              {opt.label}
              {opt.count !== undefined && ` · ${opt.count}`}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row:   { gap: 6, paddingVertical: 4 },
  pill:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillActive: { backgroundColor: moss[500] },
  label: { fontSize: 12, fontWeight: '600' },
});
