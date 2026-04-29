import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { MOCK_CONTACTS } from '@/constants/mock-contacts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMoneyCompact } from '@/lib/money';

export default function ContactDetailScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();

  const c = MOCK_CONTACTS.find((x) => x.id === id);

  if (!c) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: palette.textMuted }]}>Contact not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isClient = c.type === 'client';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace('/(tabs)/contacts')}
          hitSlop={20}
          style={styles.iconBtn}
        >
          <IconSymbol name="chevron.left" size={20} color={palette.text} />
        </Pressable>
        <Text style={[styles.headerName, { color: palette.text }]} numberOfLines={1}>{c.name}</Text>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push(`/(tabs)/contacts/new?id=${c.id}`)}
            hitSlop={6}
            style={styles.iconBtn}
          >
            <IconSymbol name="pencil" size={18} color={moss[700]} />
          </Pressable>
          <Pressable hitSlop={6} style={styles.iconBtn}>
            <IconSymbol name="ellipsis" size={20} color={palette.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Big avatar + name + type pill */}
        <View style={styles.heroBlock}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>{c.name[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.bigName, { color: palette.text }]}>{c.name}</Text>
          <View
            style={[
              styles.typePill,
              { backgroundColor: isClient ? moss[100] : slate[100] },
            ]}
          >
            <Text
              style={[
                styles.typePillText,
                { color: isClient ? moss[700] : slate[700] },
              ]}
            >
              {c.type.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Contact info */}
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {c.email && (
            <InfoRow icon="envelope" value={c.email} palette={palette} />
          )}
          {c.phone && (
            <InfoRow icon="phone" value={c.phone} palette={palette} divider />
          )}
          {(c.address_line1 || c.address_city) && (
            <InfoRow
              icon="mappin"
              value={[c.address_line1, c.address_city, c.address_state, c.address_postcode, c.address_country]
                .filter(Boolean)
                .join(', ')}
              palette={palette}
              divider
            />
          )}
        </View>

        {/* Identifiers */}
        {(c.code || c.registration_no || c.tax_id) && (
          <View style={styles.metaRow}>
            {c.code && <MetaChip label="CODE" value={c.code} palette={palette} />}
            {c.registration_no && <MetaChip label="REG NO" value={c.registration_no} palette={palette} />}
            {c.tax_id && <MetaChip label="TAX NO" value={c.tax_id} palette={palette} />}
          </View>
        )}

        {/* Persons */}
        {c.persons.length > 0 && (
          <View style={styles.personsBlock}>
            <Text style={[styles.personsLabel, { color: palette.textMuted }]}>CONTACT PERSONS</Text>
            <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              {c.persons.map((p, i) => (
                <View
                  key={p.id}
                  style={[
                    styles.personRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
                  ]}
                >
                  <View style={styles.personAvatar}>
                    <Text style={styles.personAvatarText}>{p.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personName, { color: palette.text }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.personSub, { color: palette.textMuted }]} numberOfLines={1}>
                      {p.email ?? p.phone ?? '—'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity summary (clients only) */}
        {isClient && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryHero}>
              <Text style={styles.summaryHeroEyebrow}>OUTSTANDING</Text>
              <Text style={styles.summaryHeroAmount}>
                {formatMoneyCompact(c.outstanding_minor, c.currency)}
              </Text>
              <Text style={styles.summaryHeroSub}>
                {c.invoice_count} invoice{c.invoice_count === 1 ? '' : 's'}
              </Text>
            </View>
            <View style={[styles.summarySide, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.summarySideEyebrow, { color: palette.textMuted }]}>OPEN QUOTES</Text>
              <Text style={[styles.summarySideAmount, { color: palette.text }]}>{c.quote_count}</Text>
              <Text style={[styles.summarySideSub, { color: palette.textMuted }]}>in pipeline</Text>
            </View>
          </View>
        )}

        {/* Suppliers placeholder */}
        {!isClient && (
          <View style={[styles.suppliersStub, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.suppliersStubText, { color: palette.textMuted }]}>
              Bills + spend tracking unlock in Phase 2.
            </Text>
          </View>
        )}

        {/* Inline actions at end of view (clients only) */}
        {isClient && (
          <View style={styles.actionsBlock}>
            <Pressable
              onPress={() => router.push('/(tabs)/quotations/new')}
              style={({ pressed }) => [styles.secondary, { borderColor: moss[300], backgroundColor: moss[50] }, pressed && { opacity: 0.85 }]}
            >
              <IconSymbol name="doc.text.fill" size={14} color={moss[700]} />
              <Text style={[styles.secondaryText, { color: moss[700] }]}>New quote</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/invoices/new')}
              style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
            >
              <IconSymbol name="list.bullet.rectangle.fill" size={14} color="#fff" />
              <Text style={styles.primaryText}>New invoice</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon, value, palette, divider,
}: {
  icon: 'envelope' | 'phone' | 'mappin';
  value: string;
  palette: typeof Colors.light | typeof Colors.dark;
  divider?: boolean;
}) {
  // We don't have these icons mapped on Android — fall back to a dot. iOS uses SF Symbols.
  return (
    <View
      style={[
        styles.infoRow,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
      ]}
    >
      <View style={styles.infoDot} />
      <Text style={[styles.infoValue, { color: palette.text }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function MetaChip({
  label, value, palette,
}: {
  label:   string;
  value:   string;
  palette: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={[styles.metaChip, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <Text style={[styles.metaLabel, { color: palette.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: palette.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, paddingBottom: 24, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 13 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  iconBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  headerName: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'center', marginHorizontal: 8 },
  headerRight:{ flexDirection: 'row' },

  heroBlock: { alignItems: 'center', paddingVertical: 8 },
  bigAvatar: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: moss[500],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: moss[700], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 18,
  },
  bigAvatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  bigName: { marginTop: 8, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  typePill: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  typePillText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, fontFamily: 'ui-monospace' },

  card: { borderWidth: 1, borderRadius: 12, padding: 0 },

  metaRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip:   { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 90 },
  metaLabel:  { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  metaValue:  { fontSize: 12, fontWeight: '700', marginTop: 1, fontFamily: 'ui-monospace' },

  personsBlock: { gap: 6 },
  personsLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  personRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  personAvatar: { width: 32, height: 32, borderRadius: 8, backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  personAvatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  personName:   { fontSize: 13, fontWeight: '700' },
  personSub:    { fontSize: 11, marginTop: 1 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  infoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: slate[300] },
  infoValue: { fontSize: 12, fontWeight: '500', flex: 1 },

  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryHero: {
    flex: 1.2,
    backgroundColor: moss[600],
    borderRadius: 12,
    padding: 12,
    shadowColor: moss[900],
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 18,
  },
  summaryHeroEyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  summaryHeroAmount:  { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  summaryHeroSub:     { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 2 },

  summarySide: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  summarySideEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  summarySideAmount:  { fontSize: 20, fontWeight: '800', marginTop: 2 },
  summarySideSub:     { fontSize: 10, marginTop: 2 },

  suppliersStub: { borderWidth: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  suppliersStubText: { fontSize: 11, fontStyle: 'italic' },

  actionsBlock: {
    flexDirection: 'row', gap: 8,
    marginTop: 16,
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  secondaryText: { fontSize: 13, fontWeight: '700' },
  primary: {
    flex: 1,
    backgroundColor: moss[500],
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
