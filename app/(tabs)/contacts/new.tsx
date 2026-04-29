import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { PersonEditor } from '@/components/shared/person-editor';
import { SegmentedControlPrimary } from '@/components/ui/segmented-control';
import { MOCK_CONTACTS } from '@/constants/mock-contacts';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ContactPerson, ContactType } from '@/types/api';

export default function NewContactScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();
  const params  = useLocalSearchParams<{ id?: string; type?: ContactType }>();

  const existing = useMemo(
    () => (params.id ? MOCK_CONTACTS.find((c) => c.id === params.id) ?? null : null),
    [params.id],
  );
  const isEdit = !!existing;

  const [type,    setType]    = useState<ContactType>(existing?.type ?? params.type ?? 'client');
  const [code,    setCode]    = useState(existing?.code ?? '');
  const [name,    setName]    = useState(existing?.name ?? '');
  const [regNo,   setRegNo]   = useState(existing?.registration_no ?? '');
  const [taxId,   setTaxId]   = useState(existing?.tax_id ?? '');
  const [email,   setEmail]   = useState(existing?.email ?? '');
  const [phone,   setPhone]   = useState(existing?.phone ?? '');
  const [street,  setStreet]   = useState(existing?.address_line1 ?? '');
  const [city,    setCity]     = useState(existing?.address_city ?? '');
  const [state,   setState]    = useState(existing?.address_state ?? '');
  const [postcode,setPostcode] = useState(existing?.address_postcode ?? '');
  const [country, setCountry]  = useState(existing?.address_country ?? 'Malaysia');
  const [persons, setPersons] = useState<ContactPerson[]>(existing?.persons ?? []);

  const canSave = name.trim().length > 0
    && persons.every((p) => p.name.trim().length > 0);

  const onSave = () => {
    // eslint-disable-next-line no-console
    console.log(isEdit ? 'Update contact' : 'Save contact', {
      id: existing?.id, type, code, name, registration_no: regNo, tax_id: taxId,
      email, phone,
      address_line1: street, address_city: city, address_state: state,
      address_postcode: postcode, address_country: country,
      persons,
    });
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
          <Text style={[styles.title, { color: palette.text }]}>{isEdit ? 'Edit contact' : 'New contact'}</Text>
          <Pressable onPress={onSave} disabled={!canSave} hitSlop={8}>
            <Text style={[styles.save, { color: canSave ? moss[700] : palette.textMuted }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Type segmented */}
          <SegmentedControlPrimary
            value={type}
            onChange={setType}
            options={[
              { value: 'client',   label: 'Client' },
              { value: 'supplier', label: 'Supplier' },
            ]}
          />

          {/* Basic Information */}
          <SectionHeader title="Basic Information" subtitle={type === 'client' ? 'Client identity and contact details' : 'Supplier identity and contact details'} palette={palette} />

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>{type === 'client' ? 'CLIENT CODE' : 'SUPPLIER CODE'}</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder={type === 'client' ? 'e.g. C001' : 'e.g. S001'}
                placeholderTextColor={slate[400]}
                autoCapitalize="characters"
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
              <Text style={[styles.helper, { color: palette.textMuted }]}>Short code for quick lookup</Text>
            </View>
            <View style={[styles.field, { flex: 2 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>NAME *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Company or individual name"
                placeholderTextColor={slate[400]}
                style={[
                  styles.input,
                  { color: palette.text, backgroundColor: palette.surface, borderColor: name ? moss[400] : palette.border, borderWidth: name ? 2 : 1 },
                ]}
              />
            </View>
          </View>

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>REGISTRATION NO.</Text>
              <TextInput
                value={regNo}
                onChangeText={setRegNo}
                placeholder="e.g. 123456-X"
                placeholderTextColor={slate[400]}
                autoCapitalize="characters"
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>TAX NUMBER</Text>
              <TextInput
                value={taxId}
                onChangeText={setTaxId}
                placeholder="e.g. SST / GST No."
                placeholderTextColor={slate[400]}
                autoCapitalize="characters"
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
          </View>

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="contact@example.com"
                placeholderTextColor={slate[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>PHONE</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+60 12 345 6789"
                placeholderTextColor={slate[400]}
                keyboardType="phone-pad"
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
          </View>

          {/* Address */}
          <SectionHeader title="Address" subtitle="Mailing and billing address" palette={palette} />

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>STREET ADDRESS</Text>
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="Street address, unit no., building name"
              placeholderTextColor={slate[400]}
              multiline
              style={[
                styles.input,
                { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border, minHeight: 60, textAlignVertical: 'top' },
              ]}
            />
          </View>

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>CITY</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Kuala Lumpur"
                placeholderTextColor={slate[400]}
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>STATE</Text>
              <TextInput
                value={state}
                onChangeText={setState}
                placeholder="e.g. Selangor"
                placeholderTextColor={slate[400]}
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
          </View>

          <View style={styles.row2}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>POSTCODE</Text>
              <TextInput
                value={postcode}
                onChangeText={setPostcode}
                placeholder="e.g. 50000"
                placeholderTextColor={slate[400]}
                keyboardType="number-pad"
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: palette.textMuted }]}>COUNTRY</Text>
              <TextInput
                value={country}
                onChangeText={setCountry}
                placeholder="Malaysia"
                placeholderTextColor={slate[400]}
                style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
              />
            </View>
          </View>

          {/* Contact persons */}
          <SectionHeader title="Contact Persons" subtitle="People to address quotes and invoices to" palette={palette} />

          <PersonEditor persons={persons} onChange={setPersons} />

          <Pressable
            onPress={onSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.saveBtn,
              styles.saveBtnInline,
              { opacity: canSave ? (pressed ? 0.85 : 1) : 0.5 },
            ]}
          >
            <Text style={styles.saveBtnText}>{isEdit ? 'Update contact' : 'Save contact'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title, subtitle, palette,
}: {
  title:    string;
  subtitle: string;
  palette:  typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: palette.textMuted }]}>{subtitle}</Text>
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

  scroll: { padding: 16, paddingBottom: 96, gap: 12 },

  sectionHead:    { marginTop: 8 },
  sectionTitle:   { fontSize: 14, fontWeight: '800' },
  sectionSubtitle:{ fontSize: 11, marginTop: 1 },

  row2:  { flexDirection: 'row', gap: 8 },

  field: {},
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  helper:{ fontSize: 10, marginTop: 4 },

  saveBtn: {
    backgroundColor: moss[500], borderRadius: 14, paddingVertical: 12, alignItems: 'center',
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  saveBtnInline: { marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
