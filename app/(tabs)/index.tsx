import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_EXPENSES } from '@/constants/mock-expenses';
import { MOCK_INCOMES } from '@/constants/mock-incomes';
import { MOCK_INVOICES } from '@/constants/mock-invoices';
import { MOCK_QUOTATIONS } from '@/constants/mock-quotations';
import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateShort, daysFromToday } from '@/lib/dates';
import { formatMoneyCompact } from '@/lib/money';

const ANCHOR_DATE = '2026-04-29';
const CURRENCY    = 'MYR';

function startOfMonth(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}
function inRange(iso: string, from: Date, to: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
}
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeScreen() {
  const palette = Colors[useColorScheme() ?? 'light'];
  const router  = useRouter();

  const stats = useMemo(() => {
    const monthFrom = startOfMonth(ANCHOR_DATE);
    const monthTo   = endOfMonth(ANCHOR_DATE);
    const prevFrom  = startOfMonth(new Date(monthFrom.getFullYear(), monthFrom.getMonth() - 1, 1).toISOString());
    const prevTo    = endOfMonth(new Date(monthFrom.getFullYear(), monthFrom.getMonth() - 1, 1).toISOString());

    const incomeMonth = MOCK_INCOMES
      .filter((i) => inRange(i.date, monthFrom, monthTo))
      .reduce((s, i) => s + i.total_minor, 0);
    const expenseMonth = MOCK_EXPENSES
      .filter((e) => inRange(e.date, monthFrom, monthTo))
      .reduce((s, e) => s + e.total_minor, 0);
    const incomePrev = MOCK_INCOMES
      .filter((i) => inRange(i.date, prevFrom, prevTo))
      .reduce((s, i) => s + i.total_minor, 0);
    const expensePrev = MOCK_EXPENSES
      .filter((e) => inRange(e.date, prevFrom, prevTo))
      .reduce((s, e) => s + e.total_minor, 0);

    const netMonth = incomeMonth - expenseMonth;
    const netPrev  = incomePrev - expensePrev;

    const owed = MOCK_INVOICES
      .filter((i) => i.status === 'sent' || i.status === 'overdue' || i.status === 'partially_paid')
      .reduce((s, i) => s + (i.total_minor - i.paid_minor), 0);
    const owedCount = MOCK_INVOICES.filter(
      (i) => i.status === 'sent' || i.status === 'overdue' || i.status === 'partially_paid',
    ).length;

    const overdue       = MOCK_INVOICES.filter((i) => i.status === 'overdue');
    const overdueAmount = overdue.reduce((s, i) => s + (i.total_minor - i.paid_minor), 0);

    const openQuotes    = MOCK_QUOTATIONS.filter((q) => q.status === 'open');
    const pipeline      = openQuotes.reduce((s, q) => s + q.total_minor, 0);

    const expiringSoon  = openQuotes
      .filter((q) => {
        const d = daysFromToday(q.expires_at);
        return d >= 0 && d <= 7;
      });

    const unreconciled  = [...MOCK_EXPENSES, ...MOCK_INCOMES].filter((x) => !x.reconciled).length;

    const recent = [
      ...MOCK_INVOICES.map((i) => ({ kind: 'invoice' as const, id: i.id, ref: i.ref, date: i.issue_date, label: i.contact_name, amount: i.total_minor, sign: 1 })),
      ...MOCK_EXPENSES.map((e) => ({ kind: 'expense' as const, id: e.id, ref: e.ref, date: e.date,       label: e.description ?? e.account.name, amount: e.total_minor, sign: -1 })),
      ...MOCK_INCOMES .map((n) => ({ kind: 'income'  as const, id: n.id, ref: n.ref, date: n.date,       label: n.description ?? n.account.name, amount: n.total_minor, sign: 1 })),
      ...MOCK_QUOTATIONS.map((q) => ({ kind: 'quote' as const, id: q.id, ref: q.ref, date: q.issue_date, label: q.contact_name, amount: q.total_minor, sign: 0 })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    const weeks: { label: string; income: number; expense: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const wFrom = new Date(monthFrom);
      wFrom.setDate(1 + w * 7);
      const wTo = new Date(wFrom);
      wTo.setDate(wFrom.getDate() + 6);
      wTo.setHours(23, 59, 59);
      weeks.push({
        label:   `W${w + 1}`,
        income:  MOCK_INCOMES .filter((i) => inRange(i.date, wFrom, wTo)).reduce((s, i) => s + i.total_minor, 0),
        expense: MOCK_EXPENSES.filter((e) => inRange(e.date, wFrom, wTo)).reduce((s, e) => s + e.total_minor, 0),
      });
    }
    const weeksMax = Math.max(1, ...weeks.flatMap((w) => [w.income, w.expense]));

    return {
      incomeMonth, expenseMonth, netMonth, netPrev,
      owed, owedCount,
      overdueCount: overdue.length, overdueAmount,
      pipeline, openQuotesCount: openQuotes.length,
      expiringSoon,
      unreconciled,
      recent,
      weeks, weeksMax,
      monthName: new Intl.DateTimeFormat('en-MY', { month: 'long' }).format(monthFrom),
    };
  }, []);

  const trendUp   = stats.netMonth >= stats.netPrev;
  const trendDiff = Math.abs(stats.netMonth - stats.netPrev);
  const todayLong = new Intl.DateTimeFormat('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(ANCHOR_DATE));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.workspacePill} onPress={() => router.push('/(tabs)/more')} hitSlop={6}>
            <View style={styles.workspaceAvatar}><Text style={styles.workspaceAvatarText}>A</Text></View>
            <Text style={[styles.workspaceName, { color: palette.text }]}>Acme Sdn Bhd</Text>
            <IconSymbol name="chevron.right" size={12} color={slate[400]} />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => router.push('/(tabs)/more/notifications')}
              hitSlop={8}
              style={[styles.iconBtn, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <IconSymbol name="ellipsis" size={16} color={palette.text} />
              <View style={styles.bellDot} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/more/profile')}
              hitSlop={6}
              style={({ pressed }) => [styles.profileAvatar, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.profileAvatarText}>E</Text>
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <Text style={[styles.eyebrow, { color: palette.textMuted }]}>{greeting()}</Text>
        <Text style={[styles.greeting, { color: palette.text }]}>Eva</Text>
        <Text style={[styles.greetingSub, { color: palette.textMuted }]}>{todayLong}</Text>

        {/* Hero — Net cashflow this month */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroEyebrow}>NET CASHFLOW · {stats.monthName.toUpperCase()}</Text>
            <View style={styles.heroBadge}>
              <IconSymbol name={trendUp ? 'arrow.right' : 'arrow.right'} size={10} color="#fff" />
              <Text style={styles.heroBadgeText}>{trendUp ? '↑' : '↓'} {formatMoneyCompact(trendDiff, CURRENCY)}</Text>
            </View>
          </View>
          <Text style={styles.heroAmount}>
            {stats.netMonth >= 0 ? '' : '−'}{formatMoneyCompact(Math.abs(stats.netMonth), CURRENCY)}
          </Text>
          <View style={styles.heroSplit}>
            <View style={styles.heroSplitItem}>
              <Text style={styles.heroSplitLabel}>IN</Text>
              <Text style={styles.heroSplitValue}>{formatMoneyCompact(stats.incomeMonth, CURRENCY)}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroSplitItem}>
              <Text style={styles.heroSplitLabel}>OUT</Text>
              <Text style={styles.heroSplitValue}>{formatMoneyCompact(stats.expenseMonth, CURRENCY)}</Text>
            </View>
          </View>

          {/* Sparkbar — weekly */}
          <View style={styles.sparkRow}>
            {stats.weeks.map((w) => (
              <View key={w.label} style={styles.sparkCol}>
                <View style={styles.sparkStack}>
                  <View
                    style={[styles.sparkIn,  { height: `${(w.income  / stats.weeksMax) * 100}%` }]}
                  />
                  <View
                    style={[styles.sparkOut, { height: `${(w.expense / stats.weeksMax) * 100}%` }]}
                  />
                </View>
                <Text style={styles.sparkLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* KPI strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiStrip}
        >
          <Kpi
            palette={palette}
            label="YOU'RE OWED"
            value={formatMoneyCompact(stats.owed, CURRENCY)}
            sub={`${stats.owedCount} unpaid`}
            tone="default"
            onPress={() => router.push('/(tabs)/sales')}
          />
          <Kpi
            palette={palette}
            label="PIPELINE"
            value={formatMoneyCompact(stats.pipeline, CURRENCY)}
            sub={`${stats.openQuotesCount} open quote${stats.openQuotesCount === 1 ? '' : 's'}`}
            tone="default"
            onPress={() => router.push('/(tabs)/sales')}
          />
          <Kpi
            palette={palette}
            label="OVERDUE"
            value={String(stats.overdueCount)}
            sub={`${formatMoneyCompact(stats.overdueAmount, CURRENCY)} chase up`}
            tone="amber"
            onPress={() => router.push('/(tabs)/sales')}
          />
          <Kpi
            palette={palette}
            label="UNRECONCILED"
            value={String(stats.unreconciled)}
            sub="entries to review"
            tone="default"
            onPress={() => router.push('/(tabs)/purchase')}
          />
        </ScrollView>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Quick actions</Text>
        </View>
        <View style={styles.quickGrid}>
          <QuickAction palette={palette} icon="doc.text.fill"  label="Invoice" onPress={() => router.push('/(tabs)/sales/invoices/new')} />
          <QuickAction palette={palette} icon="doc.text.fill"  label="Quote"   onPress={() => router.push('/(tabs)/sales/quotations/new')} />
          <QuickAction palette={palette} icon="cart.fill"      label="Expense" onPress={() => router.push('/(tabs)/purchase/payments/new')} />
          <QuickAction palette={palette} icon="banknote.fill"  label="Income"  onPress={() => router.push('/(tabs)/purchase/income/new')} />
        </View>

        {/* Needs attention */}
        {(stats.overdueCount > 0 || stats.expiringSoon.length > 0 || stats.unreconciled > 0) && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Needs attention</Text>
            </View>
            <View style={[styles.attCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              {MOCK_INVOICES.filter((i) => i.status === 'overdue').slice(0, 2).map((i) => {
                const days = -daysFromToday(i.due_date);
                return (
                  <AttentionRow
                    key={i.id}
                    palette={palette}
                    tone="rose"
                    icon="info.circle"
                    title={`${i.ref} · ${i.contact_name}`}
                    sub={`Overdue ${days}d · ${formatMoneyCompact(i.total_minor - i.paid_minor, CURRENCY)}`}
                    onPress={() => router.push(`/(tabs)/sales/invoices/${i.id}`)}
                  />
                );
              })}
              {stats.expiringSoon.slice(0, 2).map((q) => {
                const d = daysFromToday(q.expires_at);
                return (
                  <AttentionRow
                    key={q.id}
                    palette={palette}
                    tone="amber"
                    icon="info.circle"
                    title={`${q.ref} · ${q.contact_name}`}
                    sub={`Quote expires in ${d}d · ${formatMoneyCompact(q.total_minor, CURRENCY)}`}
                    onPress={() => router.push(`/(tabs)/sales/quotations/${q.id}`)}
                  />
                );
              })}
              {stats.unreconciled > 0 && (
                <AttentionRow
                  palette={palette}
                  tone="moss"
                  icon="info.circle"
                  title={`${stats.unreconciled} entries unreconciled`}
                  sub="Match bank statements to clear"
                  onPress={() => router.push('/(tabs)/purchase')}
                />
              )}
            </View>
          </>
        )}

        {/* Recent activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent activity</Text>
        </View>
        <View style={[styles.attCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {stats.recent.map((r) => {
            const route =
              r.kind === 'invoice'  ? `/(tabs)/sales/invoices/${r.id}`     :
              r.kind === 'quote'    ? `/(tabs)/sales/quotations/${r.id}`   :
              r.kind === 'expense'  ? `/(tabs)/purchase/payments/${r.id}`  :
                                       `/(tabs)/purchase/income/${r.id}`;
            const tone =
              r.kind === 'invoice' || r.kind === 'income' ? 'moss' :
              r.kind === 'expense'                        ? 'rose' :
                                                            'slate';
            const icon =
              r.kind === 'invoice' ? 'doc.text.fill' :
              r.kind === 'quote'   ? 'doc.text.fill' :
              r.kind === 'expense' ? 'cart.fill'     :
                                     'banknote.fill';
            const amountText =
              r.sign === 0 ? formatMoneyCompact(r.amount, CURRENCY) :
              r.sign > 0   ? `+${formatMoneyCompact(r.amount, CURRENCY)}` :
                             `−${formatMoneyCompact(r.amount, CURRENCY)}`;
            return (
              <ActivityRow
                key={`${r.kind}-${r.id}`}
                palette={palette}
                icon={icon}
                tone={tone}
                title={`${r.ref} · ${r.label}`}
                sub={formatDateShort(r.date)}
                amount={amountText}
                onPress={() => router.push(route as never)}
              />
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({
  palette, label, value, sub, tone, onPress,
}: {
  palette: typeof Colors.light | typeof Colors.dark;
  label:   string;
  value:   string;
  sub:     string;
  tone:    'default' | 'amber';
  onPress: () => void;
}) {
  const amber = tone === 'amber';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.kpiTile,
        { backgroundColor: amber ? '#FFFBEB' : palette.surface, borderColor: amber ? '#FCD34D' : palette.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.kpiLabel, { color: amber ? '#B45309' : palette.textMuted }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: amber ? '#0F172A' : palette.text }]}>{value}</Text>
      <Text style={[styles.kpiSub, { color: amber ? '#B45309' : palette.textMuted }]}>{sub}</Text>
    </Pressable>
  );
}

function QuickAction({
  palette, icon, label, onPress,
}: {
  palette: typeof Colors.light | typeof Colors.dark;
  icon:    Parameters<typeof IconSymbol>[0]['name'];
  label:   string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.qa,
        { backgroundColor: palette.surface, borderColor: palette.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.qaIcon}>
        <IconSymbol name={icon} size={18} color={moss[700]} />
      </View>
      <Text style={[styles.qaLabel, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

function AttentionRow({
  palette, icon, tone, title, sub, onPress,
}: {
  palette: typeof Colors.light | typeof Colors.dark;
  icon:    Parameters<typeof IconSymbol>[0]['name'];
  tone:    'rose' | 'amber' | 'moss';
  title:   string;
  sub:     string;
  onPress: () => void;
}) {
  const bg =
    tone === 'rose'  ? '#FEE2E2' :
    tone === 'amber' ? '#FEF3C7' :
                       moss[100];
  const fg =
    tone === 'rose'  ? '#B91C1C' :
    tone === 'amber' ? '#B45309' :
                       moss[700];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.attRow, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.attIcon, { backgroundColor: bg }]}>
        <IconSymbol name={icon} size={14} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.attTitle, { color: palette.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.attSub,   { color: palette.textMuted }]} numberOfLines={1}>{sub}</Text>
      </View>
      <IconSymbol name="chevron.right" size={14} color={slate[400]} />
    </Pressable>
  );
}

function ActivityRow({
  palette, icon, tone, title, sub, amount, onPress,
}: {
  palette: typeof Colors.light | typeof Colors.dark;
  icon:    Parameters<typeof IconSymbol>[0]['name'];
  tone:    'moss' | 'rose' | 'slate';
  title:   string;
  sub:     string;
  amount:  string;
  onPress: () => void;
}) {
  const fg =
    tone === 'moss'  ? moss[700]  :
    tone === 'rose'  ? '#B91C1C' :
                       slate[500];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.attRow, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.attIcon, { backgroundColor: palette.background }]}>
        <IconSymbol name={icon} size={14} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.attTitle, { color: palette.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.attSub,   { color: palette.textMuted }]}>{sub}</Text>
      </View>
      <Text style={[styles.actAmount, { color: fg }]} numberOfLines={1}>{amount}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32, gap: 0 },

  headerRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workspacePill:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  workspaceAvatar: { width: 26, height: 26, borderRadius: 7, backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  workspaceAvatarText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  workspaceName:   { fontSize: 13, fontWeight: '700' },

  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, position: 'relative',
  },
  bellDot: {
    position: 'absolute', top: 7, right: 7,
    width: 6, height: 6, borderRadius: 3, backgroundColor: moss[500],
  },

  profileAvatar:     { width: 32, height: 32, borderRadius: 16, backgroundColor: moss[500], alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  eyebrow:     { marginTop: 18, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  greeting:    { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  greetingSub: { fontSize: 12, marginTop: 2 },

  hero: {
    marginTop: 16,
    backgroundColor: moss[600],
    borderRadius: 18,
    padding: 18,
    shadowColor: moss[900],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
  },
  heroTopRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroEyebrow:   { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  heroBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  heroAmount:    { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 6 },

  heroSplit:      { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  heroSplitItem:  { flex: 1 },
  heroSplitLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  heroSplitValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  heroDivider:    { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 14 },

  sparkRow:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14, height: 56, gap: 6 },
  sparkCol:   { flex: 1, alignItems: 'center', gap: 4 },
  sparkStack: { width: '100%', flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, justifyContent: 'center' },
  sparkIn:    { width: 6, backgroundColor: '#fff', borderTopLeftRadius: 2, borderTopRightRadius: 2, minHeight: 2 },
  sparkOut:   { width: 6, backgroundColor: 'rgba(255,255,255,0.4)', borderTopLeftRadius: 2, borderTopRightRadius: 2, minHeight: 2 },
  sparkLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700' },

  kpiStrip: { gap: 8, paddingVertical: 14, paddingRight: 4 },
  kpiTile:  {
    width: 140, padding: 12,
    borderRadius: 14, borderWidth: 1,
  },
  kpiLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  kpiValue: { fontSize: 20, fontWeight: '800', marginTop: 6, letterSpacing: -0.3 },
  kpiSub:   { fontSize: 10, marginTop: 2 },

  section:      { marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },

  quickGrid: { flexDirection: 'row', gap: 8 },
  qa: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1,
  },
  qaIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: moss[100], alignItems: 'center', justifyContent: 'center',
  },
  qaLabel: { fontSize: 11, fontWeight: '700' },

  attCard: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  attRow:  {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  attIcon:  {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  attTitle: { fontSize: 13, fontWeight: '700' },
  attSub:   { fontSize: 11, marginTop: 2 },

  actAmount: { fontSize: 13, fontWeight: '800', marginLeft: 6 },
});
