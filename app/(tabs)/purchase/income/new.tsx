import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OptionPicker } from '@/components/shared/option-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_INCOME_CATEGORIES } from '@/constants/mock-categories';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { PaymentOption } from '@/types/api';

const METHODS: { value: PaymentOption; label: string }[] = [
  { value: 'cash',   label: 'Cash' },
  { value: 'bank',   label: 'Bank transfer' },
  { value: 'card',   label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'online', label: 'Online' },
];

export default function NewIncomeScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date,        setDate]        = useState(today);
  const [categoryId,  setCategoryId]  = useState(MOCK_INCOME_CATEGORIES[0].id);
  const [method,      setMethod]      = useState<PaymentOption>('bank');
  const [amount,      setAmount]      = useState('');
  const [taxEnabled,  setTaxEnabled]  = useState(false);
  const [description, setDescription] = useState('');
  const [internal,    setInternal]    = useState('');

  const [pickerOpen, setPickerOpen] = useState<null | 'category' | 'method'>(null);

  const category = MOCK_INCOME_CATEGORIES.find((c) => c.id === categoryId)!;

  const subtotalMinor = Math.round(Number(amount || 0) * 100);
  const taxMinor      = taxEnabled ? Math.round(subtotalMinor * 0.06) : 0;
  const totalMinor    = subtotalMinor + taxMinor;
  const canSave       = subtotalMinor > 0 && date.length > 0;

  const onSave = () => {
    // eslint-disable-next-line no-console
    console.log('Save income', {
      date, category, payment_option: method,
      amount_minor: subtotalMinor, tax_minor: taxMinor, total_minor: totalMinor,
      description, internal_remark: internal,
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={[styles.close, { color: palette.text }]}>×</Text>
          </Pressable>
          <Text style={[styles.title, { color: palette.text }]}>Record income</Text>
          <Pressable onPress={onSave} disabled={!canSave} hitSlop={8}>
            <Text style={[styles.save, { color: canSave ? moss[700] : palette.textMuted }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Section label="Date" palette={palette}>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={slate[400]}
              style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
            <Text style={[styles.helper, { color: palette.textMuted }]}>{formatDateShort(date)}</Text>
          </Section>

          <Section label="Category" palette={palette}>
            <PickerRow
              palette={palette}
              label={category.name}
              sub={`Code ${category.code}`}
              onPress={() => setPickerOpen('category')}
            />
          </Section>

          <Section label="Payment method" palette={palette}>
            <PickerRow
              palette={palette}
              label={METHODS.find((m) => m.value === method)?.label ?? method}
              onPress={() => setPickerOpen('method')}
            />
          </Section>

          <Section label="Amount" palette={palette}>
            <View style={[styles.amountWrap, { backgroundColor: palette.surface, borderColor: amount ? moss[400] : palette.border, borderWidth: amount ? 2 : 1 }]}>
              <Text style={[styles.amountPrefix, { color: palette.textMuted }]}>MYR</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={slate[400]}
                keyboardType="decimal-pad"
                style={[styles.amountInput, { color: palette.text }]}
              />
            </View>
          </Section>

          <Section label="Tax" palette={palette}>
            <Pressable
              onPress={() => setTaxEnabled(!taxEnabled)}
              style={({ pressed }) => [
                styles.taxRow,
                { backgroundColor: palette.surface, borderColor: taxEnabled ? moss[400] : palette.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.taxName, { color: palette.text }]}>SST 6%</Text>
                <Text style={[styles.taxHint, { color: palette.textMuted }]}>Toggle on if this income is tax-bearing.</Text>
              </View>
              <View style={[styles.taxPill, taxEnabled ? { backgroundColor: moss[500], borderColor: moss[500] } : { backgroundColor: 'transparent', borderColor: palette.border }]}>
                <Text style={[styles.taxPillText, { color: taxEnabled ? '#fff' : palette.textMuted }]}>
                  {taxEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </Pressable>
          </Section>

          <Section label="Description" palette={palette}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Where did this income come from?"
              placeholderTextColor={slate[400]}
              style={[styles.textarea, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
          </Section>

          <Section
            label="Internal remarks"
            palette={palette}
            trailing={<View style={styles.privateBadge}><Text style={styles.privateBadgeText}>PDF-HIDDEN</Text></View>}
          >
            <TextInput
              value={internal}
              onChangeText={setInternal}
              multiline
              placeholder="Notes only your workspace can see."
              placeholderTextColor={slate[400]}
              style={[styles.textarea, styles.textareaPrivate, { color: palette.text }]}
            />
          </Section>

          <View style={[styles.totalBlock, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View>
              <Text style={[styles.totalLabel, { color: palette.textMuted }]}>TOTAL · MYR</Text>
              <Text style={[styles.totalAmount, { color: palette.text }]}>
                +{formatMoneyCompact(totalMinor, 'MYR')}
              </Text>
              <Text style={[styles.totalBreak, { color: palette.textMuted }]}>
                Subtotal {formatMoneyCompact(subtotalMinor, 'MYR')}
                {taxEnabled && ` · Tax ${formatMoneyCompact(taxMinor, 'MYR')}`}
              </Text>
            </View>
            <Pressable
              onPress={onSave}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.saveBtn,
                { opacity: canSave ? (pressed ? 0.85 : 1) : 0.5 },
              ]}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionPicker
        visible={pickerOpen === 'category'}
        title="Pick a category"
        options={MOCK_INCOME_CATEGORIES.map((c) => ({ value: c.id, label: c.name, sublabel: `Code ${c.code}` }))}
        selected={categoryId}
        onSelect={(v) => { setCategoryId(v); setPickerOpen(null); }}
        onClose={() => setPickerOpen(null)}
      />
      <OptionPicker
        visible={pickerOpen === 'method'}
        title="Payment method"
        options={METHODS.map((m) => ({ value: m.value, label: m.label }))}
        selected={method}
        onSelect={(v) => { setMethod(v); setPickerOpen(null); }}
        onClose={() => setPickerOpen(null)}
      />
    </SafeAreaView>
  );
}

function Section({
  label, palette, trailing, children,
}: {
  label:    string;
  palette:  typeof Colors.light | typeof Colors.dark;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{label.toUpperCase()}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

function PickerRow({
  label, sub, palette, onPress,
}: {
  label:   string;
  sub?:    string;
  palette: typeof Colors.light | typeof Colors.dark;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pickerRow,
        { backgroundColor: palette.surface, borderColor: palette.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.pickerLabel, { color: palette.text }]} numberOfLines={1}>{label}</Text>
        {sub && <Text style={[styles.pickerSub, { color: palette.textMuted }]} numberOfLines={1}>{sub}</Text>}
      </View>
      <IconSymbol name="chevron.right" size={14} color={slate[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  close: { fontSize: 24, lineHeight: 24 },
  title: { fontSize: 16, fontWeight: '800' },
  save:  { fontSize: 13, fontWeight: '700' },

  scroll: { padding: 16, paddingBottom: 32 },

  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sectionLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  helper:{ fontSize: 11, marginTop: 4 },

  pickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  pickerLabel: { fontSize: 13, fontWeight: '700' },
  pickerSub:   { fontSize: 11, marginTop: 1 },

  amountWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 8,
  },
  amountPrefix: { fontSize: 13, fontWeight: '700' },
  amountInput:  { flex: 1, fontSize: 22, fontWeight: '800', textAlign: 'right' },

  taxRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 2, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  taxName: { fontSize: 13, fontWeight: '700' },
  taxHint: { fontSize: 11, marginTop: 1 },
  taxPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  taxPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  textarea: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, minHeight: 60,
    textAlignVertical: 'top',
  },
  textareaPrivate: { backgroundColor: 'rgba(254,243,199,0.4)', borderColor: '#FDE68A' },

  privateBadge:     { backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  privateBadgeText: { color: '#B45309', fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },

  totalBlock: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  totalLabel:  { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  totalAmount: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  totalBreak:  { fontSize: 10, marginTop: 1 },
  saveBtn: {
    backgroundColor: moss[500], borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
