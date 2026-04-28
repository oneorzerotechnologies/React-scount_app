import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMoneyCompact } from '@/lib/money';
import type { LineItem } from '@/types/api';

const SST_RATE = 0.06;
const SST_CODE = 'SST6';

/**
 * Inline line-item editor used by Quotation create/edit + Invoice
 * create/edit. Mirrors the web form layout:
 *   • Item name (required)
 *   • Description (optional, multi-line)
 *   • Qty × unit price → line total
 *   • Per-line tax toggle (SST 6% on/off)
 */
export function LineItemEditor({
  items,
  currency,
  onChange,
  defaultTaxCode = SST_CODE,
}: {
  items:           LineItem[];
  currency:        string;
  onChange:        (next: LineItem[]) => void;
  defaultTaxCode?: string | null;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  const update = (idx: number, patch: Partial<LineItem>) => {
    const next = items.slice();
    const li   = { ...next[idx], ...patch };
    li.line_total_minor = computeLineTotal(li);
    next[idx] = li;
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const add = () => {
    onChange([
      ...items,
      {
        name:             '',
        description:      null,
        quantity:         1,
        unit_price_minor: 0,
        tax_code:         defaultTaxCode,
        line_total_minor: 0,
      },
    ]);
  };

  return (
    <View>
      <View style={styles.list}>
        {items.map((li, i) => {
          const taxed = !!li.tax_code;
          return (
            <View
              key={i}
              style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              {/* Name + line total */}
              <View style={styles.headRow}>
                <TextInput
                  value={li.name}
                  onChangeText={(v) => update(i, { name: v })}
                  placeholder="Item name *"
                  placeholderTextColor={slate[400]}
                  style={[styles.nameInput, { color: palette.text }]}
                />
                <Text style={[styles.lineTotal, { color: palette.text }]}>
                  {formatMoneyCompact(li.line_total_minor, currency)}
                </Text>
                <Pressable onPress={() => remove(i)} hitSlop={6} style={styles.removeBtn}>
                  <Text style={{ color: slate[400], fontSize: 18, lineHeight: 18 }}>×</Text>
                </Pressable>
              </View>

              {/* Description (optional, multiline) */}
              <TextInput
                value={li.description ?? ''}
                onChangeText={(v) => update(i, { description: v.length > 0 ? v : null })}
                placeholder="Description (optional)"
                placeholderTextColor={slate[400]}
                multiline
                style={[styles.descInput, { color: palette.textMuted }]}
              />

              {/* Qty × unit price + tax toggle */}
              <View style={styles.metaRow}>
                <View style={styles.qtyGroup}>
                  <Text style={[styles.metaLabel, { color: palette.textMuted }]}>QTY</Text>
                  <TextInput
                    value={String(li.quantity)}
                    onChangeText={(v) => update(i, { quantity: Number(v) || 0 })}
                    keyboardType="numeric"
                    style={[styles.numInput, { color: palette.text, borderColor: palette.border }]}
                  />
                </View>

                <Text style={[styles.times, { color: palette.textMuted }]}>×</Text>

                <View style={styles.priceGroup}>
                  <Text style={[styles.metaLabel, { color: palette.textMuted }]}>UNIT</Text>
                  <TextInput
                    value={String(li.unit_price_minor / 100)}
                    onChangeText={(v) => update(i, { unit_price_minor: Math.round(Number(v) * 100) || 0 })}
                    keyboardType="decimal-pad"
                    style={[styles.numInput, styles.priceInput, { color: palette.text, borderColor: palette.border }]}
                  />
                </View>

                <Pressable
                  onPress={() => update(i, { tax_code: taxed ? null : SST_CODE })}
                  style={({ pressed }) => [
                    styles.taxToggle,
                    taxed
                      ? { backgroundColor: moss[500], borderColor: moss[500] }
                      : { backgroundColor: 'transparent', borderColor: palette.border },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text
                    style={[
                      styles.taxToggleText,
                      { color: taxed ? '#fff' : palette.textMuted },
                    ]}
                  >
                    {taxed ? 'SST 6%' : '+ Tax'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={add}
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
      >
        <IconSymbol name="plus" size={12} color={moss[700]} />
        <Text style={[styles.addBtnText, { color: moss[700] }]}>Add line</Text>
      </Pressable>
    </View>
  );
}

function computeLineTotal(li: LineItem): number {
  const subtotal = Math.round(li.quantity * li.unit_price_minor);
  const rate     = li.tax_code === SST_CODE ? SST_RATE : 0;
  return Math.round(subtotal * (1 + rate));
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  row: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    gap: 6,
  },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: { flex: 1, fontSize: 14, fontWeight: '700', paddingVertical: 0 },
  lineTotal: { fontSize: 14, fontWeight: '800' },
  removeBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },

  descInput: {
    fontSize: 12,
    paddingVertical: 0,
    minHeight: 18,
    textAlignVertical: 'top',
  },

  metaRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 },
  qtyGroup:   { width: 50 },
  priceGroup: { width: 88 },
  metaLabel:  { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginBottom: 2 },
  numInput: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 4,
    fontSize: 12, textAlign: 'center',
  },
  priceInput: { textAlign: 'right' },
  times:     { fontSize: 12, marginBottom: 5 },

  taxToggle: {
    marginLeft: 'auto',
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  taxToggleText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },

  addBtn: {
    marginTop: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: moss[200],
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  addBtnText: { fontSize: 12, fontWeight: '700' },
});
