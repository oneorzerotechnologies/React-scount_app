import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMoneyCompact } from '@/lib/money';
import type { LineItem } from '@/types/api';

/**
 * Inline line-item editor used by Quotation create/edit + Invoice
 * create/edit. Keeps things simple — description + quantity + unit
 * price, computes line totals as we go. Tax code picker lives in
 * a sub-screen (Phase 2) — for v0 we default to the workspace's
 * default_tax_code or null.
 */
export function LineItemEditor({
  items,
  currency,
  onChange,
  defaultTaxCode = null,
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
        description:      '',
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
        {items.map((li, i) => (
          <View
            key={i}
            style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={styles.rowMain}>
              <TextInput
                value={li.description}
                onChangeText={(v) => update(i, { description: v })}
                placeholder="Description"
                placeholderTextColor={slate[400]}
                style={[styles.descInput, { color: palette.text }]}
              />
              <Text style={[styles.lineTotal, { color: palette.text }]}>
                {formatMoneyCompact(li.line_total_minor, currency)}
              </Text>
            </View>

            <View style={styles.rowMeta}>
              <Text style={[styles.metaLabel, { color: palette.textMuted }]}>Qty</Text>
              <TextInput
                value={String(li.quantity)}
                onChangeText={(v) => update(i, { quantity: Number(v) || 0 })}
                keyboardType="numeric"
                style={[styles.numInput, { color: palette.text, borderColor: palette.border }]}
              />
              <Text style={[styles.metaLabel, { color: palette.textMuted }]}>×</Text>
              <TextInput
                value={String(li.unit_price_minor / 100)}
                onChangeText={(v) => update(i, { unit_price_minor: Math.round(Number(v) * 100) || 0 })}
                keyboardType="decimal-pad"
                style={[styles.numInput, styles.priceInput, { color: palette.text, borderColor: palette.border }]}
              />
              {li.tax_code && (
                <Text style={[styles.taxBadge, { color: moss[700], borderColor: moss[200] }]}>
                  {li.tax_code === 'SST6' ? 'SST 6%' : li.tax_code}
                </Text>
              )}

              <Pressable onPress={() => remove(i)} hitSlop={6} style={styles.removeBtn}>
                <Text style={{ color: slate[400], fontSize: 16, lineHeight: 16 }}>×</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
  const taxRate  = li.tax_code === 'SST6' ? 0.06 : 0;
  return Math.round(subtotal * (1 + taxRate));
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  row:  {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  descInput: { flex: 1, fontSize: 13, fontWeight: '600', paddingVertical: 0 },
  lineTotal: { fontSize: 13, fontWeight: '700' },

  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaLabel: { fontSize: 10 },
  numInput: {
    minWidth: 28,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 11,
    textAlign: 'center',
  },
  priceInput: { minWidth: 56 },

  taxBadge: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontFamily: 'ui-monospace',
  },

  removeBtn: {
    marginLeft: 'auto',
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },

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
