import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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

import { SegmentedControlPrimary } from '@/components/ui/segmented-control';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ContactType } from '@/types/api';

export default function NewContactScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();
  const params  = useLocalSearchParams<{ type?: ContactType }>();

  const [type,    setType]    = useState<ContactType>(params.type ?? 'client');
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [taxId,   setTaxId]   = useState('');
  const [showAddress, setShowAddress] = useState(false);

  const canSave = name.trim().length > 0;

  const onSave = () => {
    // eslint-disable-next-line no-console
    console.log('Save contact', { type, name, email, phone, taxId });
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
          <Text style={[styles.title, { color: palette.text }]}>New contact</Text>
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

          {/* Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>NAME *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Customer or supplier name"
              placeholderTextColor={slate[400]}
              style={[
                styles.input,
                { color: palette.text, backgroundColor: palette.surface, borderColor: name ? moss[400] : palette.border, borderWidth: name ? 2 : 1 },
              ]}
            />
          </View>

          {/* Email */}
          <View style={styles.field}>
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

          {/* Phone */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>PHONE</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+60 …"
              placeholderTextColor={slate[400]}
              keyboardType="phone-pad"
              style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
          </View>

          {/* Tax ID */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>TAX ID</Text>
            <TextInput
              value={taxId}
              onChangeText={setTaxId}
              placeholder="SSM no."
              placeholderTextColor={slate[400]}
              autoCapitalize="characters"
              style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
          </View>

          {/* Address (collapsed) */}
          {!showAddress ? (
            <Pressable
              onPress={() => setShowAddress(true)}
              style={({ pressed }) => [styles.addAddress, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.addAddressText, { color: moss[700] }]}>+ Add address</Text>
            </Pressable>
          ) : (
            <View style={styles.field}>
              <Text style={[styles.label, { color: palette.textMuted }]}>ADDRESS</Text>
              <TextInput
                placeholder="Street, city, state, postcode"
                placeholderTextColor={slate[400]}
                multiline
                style={[
                  styles.input,
                  { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border, minHeight: 60, textAlignVertical: 'top' },
                ]}
              />
            </View>
          )}
        </ScrollView>

        <View style={[styles.bar, { backgroundColor: palette.surface, borderTopColor: palette.border }]}>
          <Pressable
            onPress={onSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { opacity: canSave ? (pressed ? 0.85 : 1) : 0.5 },
            ]}
          >
            <Text style={styles.saveBtnText}>Save contact</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

  scroll: { padding: 16, paddingBottom: 96, gap: 16 },

  field: {},
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },

  addAddress: { paddingVertical: 8 },
  addAddressText: { fontSize: 12, fontWeight: '700' },

  bar: {
    paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    backgroundColor: moss[500], borderRadius: 14, paddingVertical: 12, alignItems: 'center',
    shadowColor: moss[700], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14,
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
