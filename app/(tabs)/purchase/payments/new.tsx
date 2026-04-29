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

import { AttachmentsField, type Attachment } from '@/components/shared/attachments-field';
import { ContactPicker } from '@/components/shared/contact-picker';
import { OptionPicker } from '@/components/shared/option-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_CASH_ACCOUNTS } from '@/constants/mock-cash-accounts';
import { MOCK_EXPENSE_ACCOUNTS, MOCK_TAX_RATES } from '@/constants/mock-categories';
import { MOCK_CONTACTS } from '@/constants/mock-contacts';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { Contact, PaymentOption } from '@/types/api';

const METHODS: { value: PaymentOption; label: string }[] = [
  { value: 'Cash',           label: 'Cash' },
  { value: 'Bank Transfer',  label: 'Bank Transfer' },
  { value: 'Cheque',         label: 'Cheque' },
  { value: 'Credit Card',    label: 'Credit Card' },
  { value: 'Online Payment', label: 'Online Payment' },
  { value: 'Other',          label: 'Other' },
];

type Picker = null | 'method' | 'paid_from' | 'account' | 'tax';

export default function NewExpenseScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [date,        setDate]        = useState(today);
  const [category,    setCategory]    = useState('');
  const [method,      setMethod]      = useState<PaymentOption>('Bank Transfer');
  const [paidFromId,  setPaidFromId]  = useState<string | null>(MOCK_CASH_ACCOUNTS[2].id);
  const [accountId,   setAccountId]   = useState<string>(MOCK_EXPENSE_ACCOUNTS[1].id);
  const [supplier,    setSupplier]    = useState<Contact | null>(null);
  const [supplierOpen,setSupplierOpen]= useState(false);
  const [amount,      setAmount]      = useState('');
  const [applyTax,    setApplyTax]    = useState(true);
  const [taxRateId,   setTaxRateId]   = useState<string>(MOCK_TAX_RATES[0].id);
  const [description, setDescription] = useState('');
  const [internal,    setInternal]    = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [picker,      setPicker]      = useState<Picker>(null);

  const account  = MOCK_EXPENSE_ACCOUNTS.find((a) => a.id === accountId)!;
  const paidFrom = MOCK_CASH_ACCOUNTS.find((a) => a.id === paidFromId) ?? null;
  const taxRate  = applyTax ? MOCK_TAX_RATES.find((t) => t.id === taxRateId) ?? null : null;

  const subtotalMinor = Math.round(Number(amount || 0) * 100);
  const taxMinor      = taxRate
    ? (taxRate.type === 'percentage'
        ? Math.round(subtotalMinor * taxRate.rate / 100)
        : Math.round(taxRate.rate * 100))
    : 0;
  const totalMinor    = subtotalMinor + taxMinor;
  const canSave       = subtotalMinor > 0 && date.length > 0 && description.trim().length > 0;

  const onSave = () => {
    // eslint-disable-next-line no-console
    console.log('Save expense', {
      date, category, account, paid_from: paidFrom, payment_option: method,
      contact: supplier, amount_minor: subtotalMinor, tax_rate: taxRate,
      tax_minor: taxMinor, total_minor: totalMinor,
      description, internal_remark: internal,
      attachments,
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
          <Text style={[styles.title, { color: palette.text }]}>Record expense</Text>
          <Pressable onPress={onSave} disabled={!canSave} hitSlop={8}>
            <Text style={[styles.save, { color: canSave ? moss[700] : palette.textMuted }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionHead title="Expense Details" palette={palette} />

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>DATE *</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={slate[400]}
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
              <Text style={[styles.helper, { color: palette.textMuted }]}>{formatDateShort(date)}</Text>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>CATEGORY</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Office Supplies"
                placeholderTextColor={slate[400]}
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>PAYMENT METHOD *</Text>
            <PickerRow
              palette={palette}
              label={METHODS.find((m) => m.value === method)?.label ?? method}
              onPress={() => setPicker('method')}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>PAID FROM</Text>
            <PickerRow
              palette={palette}
              label={paidFrom ? paidFrom.name : '— Default Bank —'}
              sub={paidFrom ? `${paidFrom.group}${paidFrom.code ? ' · ' + paidFrom.code : ''}` : 'No account'}
              onPress={() => setPicker('paid_from')}
            />
            <Text style={[styles.helper, { color: palette.textMuted }]}>
              Which bank, cash, credit card, or e-wallet paid for this expense.
            </Text>
          </View>

          <SectionHead title="Account & Supplier" palette={palette} />

          <Text style={[styles.sectionIntro, { color: palette.textMuted }]}>
            Choose which expense category this belongs to and optionally link it to a supplier for tracking.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>EXPENSE ACCOUNT *</Text>
            <PickerRow
              palette={palette}
              label={`${account.code} — ${account.name}`}
              onPress={() => setPicker('account')}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>SUPPLIER (OPTIONAL)</Text>
            <PickerRow
              palette={palette}
              label={supplier ? supplier.name : '— None —'}
              sub={supplier?.email ?? undefined}
              onPress={() => setSupplierOpen(true)}
            />
            <Text style={[styles.helper, { color: palette.textMuted }]}>
              Link to a supplier to track spending per vendor on their profile page.
            </Text>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: '800' }}>Tip:</Text>
              {' Use expenses for one-off payments (utilities, office supplies) — or for paying off a credit card / loan (pick the liability account + your bank in Paid From). For recurring supplier purchases with line items, use Bills instead.'}
            </Text>
          </View>

          <SectionHead title="Amount" palette={palette} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>AMOUNT (RM) *</Text>
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
          </View>

          <Pressable
            onPress={() => setApplyTax(!applyTax)}
            style={({ pressed }) => [
              styles.taxToggleRow,
              { backgroundColor: palette.surface, borderColor: applyTax ? moss[400] : palette.border },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={[styles.checkbox, applyTax && styles.checkboxOn]}>
              {applyTax && <IconSymbol name="checkmark" size={11} color="#fff" />}
            </View>
            <Text style={[styles.taxToggleLabel, { color: palette.text }]}>Apply Tax</Text>
          </Pressable>

          {applyTax && (
            <View style={styles.row2}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: palette.textMuted }]}>TAX RATE</Text>
                <PickerRow
                  palette={palette}
                  label={taxRate?.display_name ?? 'Select tax…'}
                  onPress={() => setPicker('tax')}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: palette.textMuted }]}>TAX AMOUNT (RM)</Text>
                <View style={[styles.readonlyBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Text style={[styles.readonlyText, { color: palette.text }]}>
                    {formatMoneyCompact(taxMinor, 'MYR')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <SectionHead title="Additional Information" palette={palette} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>DESCRIPTION *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Describe the expense…"
              placeholderTextColor={slate[400]}
              style={[styles.textarea, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHead}>
              <Text style={[styles.label, { color: palette.textMuted }]}>INTERNAL REMARKS</Text>
              <View style={styles.privateBadge}><Text style={styles.privateBadgeText}>PDF-HIDDEN</Text></View>
            </View>
            <TextInput
              value={internal}
              onChangeText={setInternal}
              multiline
              placeholder="Internal notes…"
              placeholderTextColor={slate[400]}
              style={[styles.textarea, styles.textareaPrivate, { color: palette.text }]}
            />
          </View>

          <AttachmentsField value={attachments} onChange={setAttachments} />

          <View style={[styles.totalBlock, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View>
              <Text style={[styles.totalLabel, { color: palette.textMuted }]}>TOTAL · MYR</Text>
              <Text style={[styles.totalAmount, { color: palette.text }]}>
                {formatMoneyCompact(totalMinor, 'MYR')}
              </Text>
              <Text style={[styles.totalBreak, { color: palette.textMuted }]}>
                Subtotal {formatMoneyCompact(subtotalMinor, 'MYR')}
                {taxRate && ` · ${taxRate.display_name} ${formatMoneyCompact(taxMinor, 'MYR')}`}
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
              <Text style={styles.saveBtnText}>Record Expense</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionPicker
        visible={picker === 'method'}
        title="Payment method"
        options={METHODS.map((m) => ({ value: m.value, label: m.label }))}
        selected={method}
        onSelect={(v) => { setMethod(v as PaymentOption); setPicker(null); }}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        visible={picker === 'paid_from'}
        title="Paid from"
        subtitle="Cash · Bank · Credit Card · E-Wallet"
        options={MOCK_CASH_ACCOUNTS.map((a) => ({
          value: a.id, label: `${a.code ? a.code + ' — ' : ''}${a.name}`,
          sublabel: `${a.group}${a.issuer ? ' · ' + a.issuer : ''}`,
        }))}
        selected={paidFromId ?? undefined}
        onSelect={(v) => { setPaidFromId(v); setPicker(null); }}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        visible={picker === 'account'}
        title="Expense account"
        subtitle="Chart of accounts"
        options={MOCK_EXPENSE_ACCOUNTS.map((a) => ({
          value: a.id, label: `${a.code} — ${a.name}`,
        }))}
        selected={accountId}
        onSelect={(v) => { setAccountId(v); setPicker(null); }}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        visible={picker === 'tax'}
        title="Tax rate"
        options={MOCK_TAX_RATES.map((t) => ({
          value: t.id, label: t.display_name,
          sublabel: t.type === 'percentage' ? `${t.rate}% on subtotal` : `Fixed RM ${t.rate}`,
        }))}
        selected={taxRateId}
        onSelect={(v) => { setTaxRateId(v); setPicker(null); }}
        onClose={() => setPicker(null)}
      />

      <ContactPicker
        visible={supplierOpen}
        contacts={MOCK_CONTACTS}
        filter="supplier"
        onSelect={(c) => { setSupplier(c); setSupplierOpen(false); }}
        onClose={() => setSupplierOpen(false)}
      />
    </SafeAreaView>
  );
}

function SectionHead({ title, palette }: { title: string; palette: typeof Colors.light | typeof Colors.dark }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
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

  scroll: { padding: 16, paddingBottom: 32, gap: 12 },

  sectionHead:    { marginTop: 8 },
  sectionTitle:   { fontSize: 14, fontWeight: '800' },
  sectionIntro:   { fontSize: 11, lineHeight: 15, marginTop: -4 },

  tipBox:  { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 12, padding: 12 },
  tipText: { color: '#1D4ED8', fontSize: 11, lineHeight: 15 },

  row2:  { flexDirection: 'row', gap: 8 },
  field: {},
  fieldHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  helper:{ fontSize: 11, marginTop: 4 },

  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
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

  readonlyBox:  { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, alignItems: 'flex-end' },
  readonlyText: { fontSize: 14, fontWeight: '700' },

  taxToggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  taxToggleLabel: { fontSize: 13, fontWeight: '700' },

  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#94a3b8',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOn: { backgroundColor: moss[600], borderColor: moss[600] },

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
