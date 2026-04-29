import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Workspace = {
  id:    string;
  name:  string;
  role:  'OWNER' | 'ADMIN' | 'MEMBER';
  letter:string;
  plan:  'Free' | 'Pro' | 'Business';
};

const WORKSPACES: Workspace[] = [
  { id: 'w_acme',    name: 'Acme Sdn Bhd',         role: 'OWNER',  letter: 'A', plan: 'Pro'      },
  { id: 'w_borneo',  name: 'Borneo Coffee Co.',    role: 'ADMIN',  letter: 'B', plan: 'Free'     },
  { id: 'w_kedai',   name: 'Kedai Runcit Mei Ling',role: 'MEMBER', letter: 'K', plan: 'Business' },
];

export default function WorkspacesScreen() {
  const palette = Colors[useColorScheme()];
  const router  = useRouter();

  const [activeId, setActiveId] = useState('w_acme');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <IconSymbol name="chevron.left" size={20} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Workspaces</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.intro, { color: palette.textMuted }]}>
          Switch between businesses you belong to. Data, contacts, and reports are isolated per workspace.
        </Text>

        <View style={[styles.group, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {WORKSPACES.map((w, i) => {
            const active = w.id === activeId;
            return (
              <Pressable
                key={w.id}
                onPress={() => setActiveId(w.id)}
                style={({ pressed }) => [
                  styles.row,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.avatar, active && styles.avatarActive]}>
                  <Text style={styles.avatarText}>{w.letter}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: palette.text }]}>{w.name}</Text>
                    <View style={styles.rolePill}>
                      <Text style={styles.rolePillText}>{w.role}</Text>
                    </View>
                  </View>
                  <Text style={[styles.sub, { color: palette.textMuted }]}>{w.plan} plan</Text>
                </View>
                {active ? (
                  <View style={styles.activeBadge}>
                    <IconSymbol name="checkmark" size={12} color="#fff" />
                  </View>
                ) : (
                  <IconSymbol name="chevron.right" size={14} color={slate[400]} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { borderColor: palette.border, backgroundColor: palette.surface },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.addIcon}>
            <IconSymbol name="plus" size={16} color={moss[700]} />
          </View>
          <Text style={[styles.addText, { color: palette.text }]}>Create new workspace</Text>
        </Pressable>

        <View style={[styles.tipBox, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.tipText}>
            <Text style={{ fontWeight: '800' }}>Tip:</Text>
            {' Owner and Admin roles can invite teammates from the workspace settings on the web app.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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

  intro: { fontSize: 12, lineHeight: 16, marginBottom: 4 },

  group: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: slate[300],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarActive: { backgroundColor: moss[500] },
  avatarText:   { color: '#fff', fontSize: 14, fontWeight: '800' },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:    { fontSize: 13, fontWeight: '800' },
  sub:     { fontSize: 11, marginTop: 2 },

  rolePill:     { backgroundColor: moss[100], paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  rolePillText: { color: moss[700], fontSize: 8, fontWeight: '800', letterSpacing: 0.6, fontFamily: 'ui-monospace' },

  activeBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: moss[500],
    alignItems: 'center', justifyContent: 'center',
  },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 14,
  },
  addIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: moss[100],
    alignItems: 'center', justifyContent: 'center',
  },
  addText: { fontSize: 13, fontWeight: '700' },

  tipBox:  { borderWidth: 1, borderRadius: 12, padding: 12 },
  tipText: { color: '#1D4ED8', fontSize: 11, lineHeight: 15 },
});
