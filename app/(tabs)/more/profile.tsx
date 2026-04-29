import { useRouter } from 'expo-router';
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

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const palette = Colors[useColorScheme()];
  const router  = useRouter();

  const [name,  setName]  = useState('Eva Tan');
  const [email, setEmail] = useState('eva@acme.co');
  const [phone, setPhone] = useState('+60 12-345 6789');
  const [dirty, setDirty] = useState(false);

  const onSave = () => {
    setDirty(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <IconSymbol name="chevron.left" size={20} color={palette.text} />
          </Pressable>
          <Text style={[styles.title, { color: palette.text }]}>Profile</Text>
          <Pressable onPress={onSave} disabled={!dirty} hitSlop={8}>
            <Text style={[styles.save, { color: dirty ? moss[700] : palette.textMuted }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>E</Text>
            </View>
            <Pressable style={styles.changePhoto}>
              <Text style={[styles.changePhotoText, { color: moss[700] }]}>Change photo</Text>
            </Pressable>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>OWNER</Text>
            </View>
          </View>

          <Field label="FULL NAME"    value={name}  onChangeText={(v) => { setName(v);  setDirty(true); }} palette={palette} />
          <Field label="EMAIL"        value={email} onChangeText={(v) => { setEmail(v); setDirty(true); }} palette={palette} keyboardType="email-address" autoCapitalize="none" />
          <Field label="PHONE NUMBER" value={phone} onChangeText={(v) => { setPhone(v); setDirty(true); }} palette={palette} keyboardType="phone-pad" />

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>SECURITY</Text>
          </View>
          <View style={[styles.group, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Pressable style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Change password</Text>
              <IconSymbol name="chevron.right" size={12} color={slate[400]} />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.itemRow, styles.itemDivider, { borderTopColor: palette.border }, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Two-factor authentication</Text>
              <Text style={[styles.itemValue, { color: palette.textMuted }]}>Off</Text>
              <IconSymbol name="chevron.right" size={12} color={slate[400]} />
            </Pressable>
            <Pressable style={({ pressed }) => [styles.itemRow, styles.itemDivider, { borderTopColor: palette.border }, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Active sessions</Text>
              <Text style={[styles.itemValue, { color: palette.textMuted }]}>2 devices</Text>
              <IconSymbol name="chevron.right" size={12} color={slate[400]} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.replace('/(auth)/login')}
            style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChangeText, palette, keyboardType, autoCapitalize,
}: {
  label:           string;
  value:           string;
  onChangeText:    (v: string) => void;
  palette:         typeof Colors.light | typeof Colors.dark;
  keyboardType?:   'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={slate[400]}
        style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 16, fontWeight: '800' },
  save:  { fontSize: 13, fontWeight: '700' },

  avatarBlock: { alignItems: 'center', gap: 8, marginBottom: 8 },
  avatar: {
    width: 84, height: 84, borderRadius: 24,
    backgroundColor: moss[500],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  changePhoto:     { paddingVertical: 4, paddingHorizontal: 8 },
  changePhotoText: { fontSize: 12, fontWeight: '700' },

  rolePill:     { backgroundColor: moss[100], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rolePillText: { color: moss[700], fontSize: 9, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },

  field: {},
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },

  section:      { marginTop: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },

  group: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  itemDivider: { borderTopWidth: StyleSheet.hairlineWidth },
  itemLabel:   { flex: 1, fontSize: 13, fontWeight: '500' },
  itemValue:   { fontSize: 11 },

  signOut: {
    marginTop: 12,
    borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  signOutText: { color: '#B91C1C', fontSize: 13, fontWeight: '800' },
});
