import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { moss, slate } from '@/constants/theme';

/**
 * Status-driven coloured pill. One component per badge; status
 * decides the look. Don't pass colour props — the design rule is
 * "status pills are status-driven, not state-driven".
 */
type StatusKind =
  | 'open' | 'accepted' | 'declined' | 'expired' | 'converted' | 'draft'
  | 'sent' | 'paid' | 'partially_paid' | 'overdue';

const PALETTES: Record<StatusKind, { bg: string; fg: string; label: string }> = {
  draft:           { bg: slate[100], fg: slate[700],  label: 'DRAFT' },
  open:            { bg: slate[100], fg: slate[700],  label: 'OPEN' },
  accepted:        { bg: moss[100],  fg: moss[700],   label: 'ACCEPTED' },
  declined:        { bg: '#FEE2E2', fg: '#B91C1C',    label: 'DECLINED' },
  expired:         { bg: slate[100], fg: slate[500],  label: 'EXPIRED' },
  converted:       { bg: moss[100],  fg: moss[700],   label: 'CONVERTED' },
  sent:            { bg: '#FEF3C7', fg: '#B45309',    label: 'SENT' },
  paid:            { bg: moss[100],  fg: moss[700],   label: 'PAID' },
  partially_paid:  { bg: '#FEF3C7', fg: '#B45309',    label: 'PARTIAL' },
  overdue:         { bg: '#FEE2E2', fg: '#B91C1C',    label: 'OVERDUE' },
};

export function StatusPill({
  status,
  style,
  textStyle,
}: {
  status: StatusKind;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const p = PALETTES[status];
  return (
    <View style={[styles.pill, { backgroundColor: p.bg }, style]}>
      <Text style={[styles.text, { color: p.fg }, textStyle]}>{p.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: 'ui-monospace',
  },
});
