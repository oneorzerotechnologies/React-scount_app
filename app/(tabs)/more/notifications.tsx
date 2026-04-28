import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterPills, type FilterPillOption } from '@/components/ui/filter-pills';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, moss } from '@/constants/theme';
import { MOCK_NOTIFICATIONS } from '@/constants/mock-notifications';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { daysFromToday } from '@/lib/dates';
import type { AppNotification, NotificationCategory } from '@/types/api';

const RED = '#B91C1C';
const RED_BG = '#FEE2E2';

const CATEGORY_TINT: Record<NotificationCategory, { bg: string; fg: string }> = {
  invoice_paid:    { bg: moss[500], fg: '#fff' },
  quote_accepted:  { bg: moss[500], fg: '#fff' },
  invoice_overdue: { bg: RED,       fg: '#fff' },
  quote_viewed:    { bg: '#F1F5F9', fg: '#475569' },
  weekly_digest:   { bg: '#F1F5F9', fg: '#475569' },
};

export default function NotificationsScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [items,  setItems]  = useState(MOCK_NOTIFICATIONS);

  const visible =
    filter === 'unread' ? items.filter((i) => !i.read) :
    items;
  const unreadCount = items.filter((i) => !i.read).length;

  const today    = visible.filter((i) => daysFromToday(i.occurred_at) >= 0);
  const earlier  = visible.filter((i) => daysFromToday(i.occurred_at) < 0);

  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={20} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Notifications</Text>
        <Pressable onPress={markAllRead} hitSlop={8}>
          <Text style={[styles.markAll, { color: moss[700] }]}>Mark all</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all',      label: 'All',      count: items.length },
            { value: 'unread',   label: 'Unread',   count: unreadCount },
            { value: 'mentions', label: 'Mentions' },
          ] as FilterPillOption<'all' | 'unread' | 'mentions'>[]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {today.length > 0 && (
          <Section label="TODAY" palette={palette}>
            {today.map((n) => (
              <NotifRow key={n.id} n={n} palette={palette} onPress={() => n.href && router.push(n.href as never)} />
            ))}
          </Section>
        )}

        {earlier.length > 0 && (
          <Section label="EARLIER THIS WEEK" palette={palette}>
            {earlier.map((n) => (
              <NotifRow key={n.id} n={n} palette={palette} onPress={() => n.href && router.push(n.href as never)} />
            ))}
          </Section>
        )}

        {visible.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: palette.textMuted }]}>All caught up.</Text>
          </View>
        )}
      </ScrollView>
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
      <Text style={[styles.eyebrow, { color: palette.textMuted }]}>{label}</Text>
      <View style={{ marginTop: 6, gap: 6 }}>{children}</View>
    </View>
  );
}

function NotifRow({
  n, palette, onPress,
}: {
  n: AppNotification;
  palette: typeof Colors.light | typeof Colors.dark;
  onPress: () => void;
}) {
  const tint = CATEGORY_TINT[n.category];
  const isRed = n.category === 'invoice_overdue';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notifRow,
        {
          backgroundColor: !n.read
            ? (isRed ? RED_BG : moss[50])
            : palette.surface,
          borderColor: !n.read
            ? (isRed ? '#FECACA' : moss[200])
            : palette.border,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.notifIcon, { backgroundColor: tint.bg }]}>
        <Text style={[styles.notifIconText, { color: tint.fg }]}>
          {n.category === 'invoice_paid' || n.category === 'quote_accepted'
            ? '✓'
            : n.category === 'invoice_overdue'
            ? '!'
            : '·'}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.notifTitleRow}>
          <Text style={[styles.notifTitle, { color: palette.text }]} numberOfLines={1}>
            {n.title}
          </Text>
          {!n.read && (
            <View style={[styles.dot, { backgroundColor: isRed ? RED : moss[500] }]} />
          )}
        </View>
        <Text style={[styles.notifBody, { color: palette.text }]} numberOfLines={2}>
          {n.body}
        </Text>
        <Text style={[styles.notifTime, { color: palette.textMuted }]}>
          {relativeTime(n.occurred_at)}
        </Text>
      </View>
    </Pressable>
  );
}

function relativeTime(iso: string): string {
  const diffH = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (diffH < 24) return `${Math.max(1, Math.round(diffH))}h ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD}d ago`;
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  title:   { fontSize: 16, fontWeight: '800' },
  markAll: { fontSize: 13, fontWeight: '700' },

  filterRow: { paddingHorizontal: 16, marginTop: 4 },

  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, fontFamily: 'ui-monospace' },

  notifRow: {
    flexDirection: 'row', gap: 10,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  notifIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notifIconText: { fontSize: 16, fontWeight: '800' },

  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle:    { fontSize: 13, fontWeight: '800' },
  dot:           { width: 6, height: 6, borderRadius: 3 },

  notifBody: { fontSize: 11, marginTop: 2 },
  notifTime: { fontSize: 9, marginTop: 2, fontFamily: 'ui-monospace' },

  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 13 },
});
