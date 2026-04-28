import { StyleSheet, Text, View } from 'react-native';

import { Colors, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * The "Additional information" card used on Quotation + Invoice
 * detail screens. Shows terms / remarks / internal remarks compactly,
 * with the internal-remarks line wearing an amber PRIVATE badge so
 * users never confuse PDF-visible vs. PDF-hidden.
 */
export function AdditionalInfoCard({
  terms,
  remarks,
  internal,
}: {
  terms?:    string | null;
  remarks?:  string | null;
  internal?: string | null;
}) {
  const palette = Colors[useColorScheme() ?? 'light'];

  // Skip the whole card if the workspace hasn't set anything.
  if (!terms && !remarks && !internal) return null;

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.eyebrow, { color: palette.textMuted }]}>ADDITIONAL INFORMATION</Text>

      {terms && (
        <Row label="Terms" labelColor={palette.textMuted}>
          <Text style={[styles.value, { color: palette.text }]} numberOfLines={2}>{terms}</Text>
        </Row>
      )}

      {remarks && (
        <Row label="Remarks" labelColor={palette.textMuted}>
          <Text style={[styles.value, { color: palette.text }]} numberOfLines={2}>{remarks}</Text>
        </Row>
      )}

      {internal && (
        <Row
          label="Internal"
          labelColor={palette.textMuted}
          labelTrailing={
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>PRIVATE</Text>
            </View>
          }
        >
          <Text
            style={[styles.value, styles.italic, { color: palette.text }]}
            numberOfLines={2}
          >
            {internal}
          </Text>
        </Row>
      )}
    </View>
  );
}

function Row({
  label,
  labelColor,
  labelTrailing,
  children,
}: {
  label: string;
  labelColor: string;
  labelTrailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {labelTrailing}
      </View>
      <View style={styles.valueCol}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },

  row:      { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  labelCol: { width: 70, flexDirection: 'row', alignItems: 'center', gap: 4 },
  valueCol: { flex: 1 },

  label:  { fontSize: 11 },
  value:  { fontSize: 11, fontWeight: '500' },
  italic: { fontStyle: 'italic' },

  privateBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  privateBadgeText: {
    color: '#B45309',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: 'ui-monospace',
  },
  // unused but reserved for future override
  _slate: { color: slate[500] },
});
