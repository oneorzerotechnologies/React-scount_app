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

import { ContactPicker } from '@/components/shared/contact-picker';
import { LineItemEditor } from '@/components/shared/line-item-editor';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_CONTACTS } from '@/constants/mock-contacts';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';
import type { Contact, LineItem } from '@/types/api';

export default function NewInvoiceScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dueIn30 = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [contact,      setContact]      = useState<Contact | null>(MOCK_CONTACTS[0]);
  const [items,        setItems]        = useState<LineItem[]>([
    { description: 'Audit retainer · April', quantity: 1, unit_price_minor: 800_000, tax_code: 'SST6', line_total_minor: 848_000 },
  ]);
  const [terms,        setTerms]        = useState('Net 30. 1.5% per month on overdue balances.');
  const [remarks,      setRemarks]      = useState('Bank-in to MBB 5142-***-***.');
  const [internalNote, setInternalNote] = useState('');

  const total = items.reduce((sum, li) => sum + li.line_total_minor, 0);
  const canSave = !!contact && items.length > 0 && items.every((li) => li.description.trim().length > 0);

  const onSave = () => {
    // eslint-disable-next-line no-console
    console.log('Save invoice', { contact, items, terms, remarks, internalNote });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={[styles.close, { color: palette.text }]}>×</Text>
          </Pressable>
          <Text style={[styles.title, { color: palette.text }]}>New invoice</Text>
          <Pressable onPress={onSave} disabled={!canSave} hitSlop={8}>
            <Text style={[styles.save, { color: canSave ? moss[700] : palette.textMuted }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Section label="Contact" palette={palette}>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.contactBtn,
                { backgroundColor: palette.surface, borderColor: contact ? moss[400] : palette.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                  {contact ? contact.name[0].toUpperCase() : '?'}
                </Text>
              </View>
              <Text style={[styles.contactName, { color: palette.text }]} numberOfLines={1}>
                {contact ? contact.name : 'Pick a contact'}
              </Text>
              <IconSymbol name="chevron.right" size={14} color={slate[400]} />
            </Pressable>
          </Section>

          <View style={styles.dateGrid}>
            <DateChip label="Issued"   value={formatDateShort(today)}    palette={palette} />
            <DateChip
              label="Due"
              value={formatDateShort(dueIn30)}
              palette={palette}
              highlight
            />
            <DateChip label="Delivery" value="30d"                       palette={palette} />
          </View>

          <Section label="Line items" palette={palette}>
            <LineItemEditor
              items={items}
              onChange={setItems}
              currency="MYR"
              defaultTaxCode="SST6"
            />
          </Section>

          <Section label="Terms & conditions" palette={palette}>
            <TextInput
              value={terms}
              onChangeText={setTerms}
              multiline
              placeholder="Payment terms, late fees, recurrence note…"
              placeholderTextColor={slate[400]}
              style={[styles.textarea, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
          </Section>

          <Section label="Remarks" palette={palette}>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              multiline
              placeholder="Visible on the customer PDF."
              placeholderTextColor={slate[400]}
              style={[styles.textarea, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
          </Section>

          <Section
            label="Internal remarks"
            palette={palette}
            trailing={
              <View style={styles.privateBadge}>
                <Text style={styles.privateBadgeText}>PDF-HIDDEN</Text>
              </View>
            }
          >
            <TextInput
              value={internalNote}
              onChangeText={setInternalNote}
              multiline
              placeholder="Notes only your workspace can see."
              placeholderTextColor={slate[400]}
              style={[styles.textarea, styles.textareaPrivate, { color: palette.text }]}
            />
          </Section>
        </ScrollView>

        <View style={[styles.totalBar, { backgroundColor: palette.surface, borderTopColor: palette.border }]}>
          <View>
            <Text style={[styles.totalLabel, { color: palette.textMuted }]}>TOTAL · MYR</Text>
            <Text style={[styles.totalAmount, { color: palette.text }]}>
              {formatMoneyCompact(total, 'MYR')}
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
            <Text style={styles.saveBtnText}>Save & send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ContactPicker
        visible={pickerOpen}
        contacts={MOCK_CONTACTS}
        filter="client"
        onSelect={(c) => { setContact(c); setPickerOpen(false); }}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

function Section({
  label, palette, trailing, children,
}: {
  label: string;
  palette: typeof Colors.light | typeof Colors.dark;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
          {label.toUpperCase()}
        </Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

function DateChip({
  label, value, palette, highlight,
}: {
  label: string;
  value: string;
  palette: typeof Colors.light | typeof Colors.dark;
  highlight?: boolean;
}) {
  return (
    <View
      style={[
        styles.dateChip,
        {
          backgroundColor: palette.surface,
          borderColor: highlight ? moss[400] : palette.border,
          borderWidth: highlight ? 2 : 1,
        },
      ]}
    >
      <Text style={[styles.dateLabel, { color: palette.textMuted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.dateValue, { color: palette.text }]}>{value}</Text>
    </View>
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

  scroll: { padding: 16, paddingBottom: 96 },

  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sectionLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 2, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  contactAvatar: { width: 28, height: 28, borderRadius: 8, backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  contactAvatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  contactName: { flex: 1, fontSize: 13, fontWeight: '600' },

  dateGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  dateChip: { flex: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  dateLabel:{ fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  dateValue:{ fontSize: 13, fontWeight: '700', marginTop: 2 },

  textarea: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, minHeight: 60,
    textAlignVertical: 'top',
  },
  textareaPrivate: {
    backgroundColor: 'rgba(254,243,199,0.4)',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  privateBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  privateBadgeText: {
    color: '#B45309', fontSize: 7, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace',
  },

  totalBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalLabel:  { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  totalAmount: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  saveBtn: {
    backgroundColor: moss[500],
    borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
