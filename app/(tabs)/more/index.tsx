import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OptionPicker } from '@/components/shared/option-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useThemeMode, type ThemeMode } from '@/contexts/theme-mode';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';

const APPEARANCE_LABELS: Record<ThemeMode, string> = {
  light:  'Light',
  dark:   'Dark',
  system: 'System',
};

export default function MoreScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const [biometric, setBiometric]         = useState(true);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const { mode, setMode } = useThemeMode();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: palette.text }]}>More</Text>

        {/* Profile card */}
        <Pressable
          onPress={() => router.push('/(tabs)/more/profile')}
          style={({ pressed }) => [
            styles.row, styles.bigRow,
            { backgroundColor: palette.surface, borderColor: palette.border },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.avatar, { width: 40, height: 40, borderRadius: 12 }]}>
            <Text style={styles.avatarText}>E</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: palette.text }]}>Eva Tan</Text>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>OWNER</Text>
              </View>
            </View>
            <Text style={[styles.email, { color: palette.textMuted }]}>eva@acme.co</Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={palette.textMuted as string} />
        </Pressable>

        {/* Workspace card */}
        <Pressable
          onPress={() => router.push('/(tabs)/more/workspaces')}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: palette.surface, borderColor: palette.border },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.avatar, { width: 28, height: 28, borderRadius: 6 }]}>
            <Text style={[styles.avatarText, { fontSize: 11 }]}>A</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.workspaceName, { color: palette.text }]}>Acme Sdn Bhd</Text>
            <Text style={[styles.workspaceSub, { color: palette.textMuted }]}>
              Switch workspace · 3 available
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={palette.textMuted as string} />
        </Pressable>

        {/* Preferences */}
        <Section label="Preferences" palette={palette}>
          <View style={[styles.group, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <View style={styles.itemRow}>
              <View style={styles.iconHolder}><IconSymbol name="info.circle" size={14} color={slate[500]} /></View>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Biometric unlock</Text>
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ true: moss[500], false: slate[300] }}
                thumbColor="#fff"
              />
            </View>
            <Pressable
              onPress={() => setAppearanceOpen(true)}
              style={({ pressed }) => [styles.itemRow, styles.itemDivider, { borderTopColor: palette.border }, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.iconHolder}><IconSymbol name="info.circle" size={14} color={slate[500]} /></View>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Appearance</Text>
              <Text style={[styles.itemValue, { color: palette.textMuted }]}>{APPEARANCE_LABELS[mode]}</Text>
              <IconSymbol name="chevron.right" size={12} color={palette.textMuted as string} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/more/notifications')}
              style={({ pressed }) => [styles.itemRow, styles.itemDivider, { borderTopColor: palette.border }, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.iconHolder}><IconSymbol name="info.circle" size={14} color={slate[500]} /></View>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Notifications</Text>
              <Text style={[styles.itemValue, { color: moss[700] }]}>5 of 5 on</Text>
              <IconSymbol name="chevron.right" size={12} color={palette.textMuted as string} />
            </Pressable>
          </View>
        </Section>

        {/* Support */}
        <Section label="Support" palette={palette}>
          <View style={[styles.group, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Pressable
              onPress={() => Linking.openURL('https://scount.my/help')}
              style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.iconHolder}><IconSymbol name="info.circle" size={14} color={slate[500]} /></View>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Help &amp; FAQ</Text>
              <IconSymbol name="chevron.right" size={12} color={palette.textMuted as string} />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('mailto:support@scount.my?subject=scount.my%20mobile%20feedback')}
              style={({ pressed }) => [styles.itemRow, styles.itemDivider, { borderTopColor: palette.border }, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.iconHolder}><IconSymbol name="info.circle" size={14} color={slate[500]} /></View>
              <Text style={[styles.itemLabel, { color: palette.text }]}>Send feedback</Text>
              <IconSymbol name="chevron.right" size={12} color={palette.textMuted as string} />
            </Pressable>
          </View>
        </Section>

        {/* Open on web */}
        <Pressable
          onPress={() => Linking.openURL('https://scount.my')}
          style={({ pressed }) => [
            styles.webCard,
            { borderColor: moss[200], backgroundColor: moss[50] },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.webCardText, { color: moss[700] }]}>
            Get the rest on scount.my
          </Text>
          <Text style={[styles.webCardArrow, { color: moss[700] }]}>↗</Text>
        </Pressable>

        {/* Sign out */}
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={({ pressed }) => [
            styles.signOut,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        {/* Footer */}
        <Text style={[styles.footer, { color: palette.textMuted }]}>
          scount.my mobile · v1.0.0 · build 142
        </Text>
      </ScrollView>

      <OptionPicker<ThemeMode>
        visible={appearanceOpen}
        title="Appearance"
        subtitle="Override system theme"
        options={[
          { value: 'system', label: 'System', sublabel: 'Match device setting' },
          { value: 'light',  label: 'Light' },
          { value: 'dark',   label: 'Dark'  },
        ]}
        selected={mode}
        onSelect={(v) => { setMode(v); setAppearanceOpen(false); }}
        onClose={() => setAppearanceOpen(false)}
      />
    </SafeAreaView>
  );
}

function Section({
  label, palette, children,
}: {
  label: string;
  palette: typeof Colors.light | typeof Colors.dark;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{label.toUpperCase()}</Text>
      <View style={{ marginTop: 6 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },

  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    marginTop: 12,
  },
  bigRow: {},

  avatar: { backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:    { fontSize: 13, fontWeight: '800' },
  email:   { fontSize: 11, marginTop: 1 },

  rolePill:     { backgroundColor: moss[100], paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  rolePillText: { color: moss[700], fontSize: 8, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },

  workspaceName: { fontSize: 13, fontWeight: '700' },
  workspaceSub:  { fontSize: 10, marginTop: 1 },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

  group: { borderWidth: 1, borderRadius: 12 },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  itemDivider: { borderTopWidth: StyleSheet.hairlineWidth },
  iconHolder:  { width: 18, alignItems: 'center' },
  itemLabel:   { flex: 1, fontSize: 13, fontWeight: '500' },
  itemValue:   { fontSize: 11 },

  webCard: {
    marginTop: 12,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  webCardText:  { fontSize: 13, fontWeight: '700' },
  webCardArrow: { fontSize: 14, fontWeight: '700' },

  signOut: {
    marginTop: 8,
    borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  signOutText: { color: '#B91C1C', fontSize: 13, fontWeight: '800' },

  footer: { marginTop: 16, fontSize: 10, fontFamily: 'ui-monospace', textAlign: 'center' },
});
