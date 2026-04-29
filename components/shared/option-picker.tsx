import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type OptionItem<V extends string> = {
  value:     V;
  label:     string;
  sublabel?: string;
};

/**
 * Generic bottom-sheet single-select picker. Used for expense category,
 * cash account, payment method, and any other small enum on a form.
 */
export function OptionPicker<V extends string>({
  visible,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible:   boolean;
  title:     string;
  subtitle?: string;
  options:   OptionItem<V>[];
  selected?: V;
  onSelect:  (value: V) => void;
  onClose:   () => void;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: palette.textMuted }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ color: palette.textMuted, fontSize: 22, lineHeight: 22 }}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
            {options.map((opt) => {
              const isSelected = opt.value === selected;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => onSelect(opt.value)}
                  style={({ pressed }) => [
                    styles.row,
                    { borderBottomColor: palette.border },
                    pressed && { backgroundColor: palette.surfaceMuted },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optLabel, { color: palette.text }]} numberOfLines={1}>{opt.label}</Text>
                    {opt.sublabel && (
                      <Text style={[styles.optSub, { color: palette.textMuted }]} numberOfLines={1}>
                        {opt.sublabel}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <IconSymbol name="checkmark" size={16} color={moss[600]} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 6, paddingBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16,
  },
  handle: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#cbd5e1', marginVertical: 8,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  title:    { fontSize: 14, fontWeight: '800' },
  subtitle: { fontSize: 11, marginTop: 1 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optLabel: { fontSize: 14, fontWeight: '700' },
  optSub:   { fontSize: 11, marginTop: 1 },
});
