# Mobile Layout

Suggested file structure for the Expo + React Native app. Pairs with [`TECH-DECISIONS.md`](TECH-DECISIONS.md) (the why) and [`UI-DESIGN.md`](UI-DESIGN.md) (the screens). Designed to drop into a fresh `npx create-expo-app@latest` scaffold with minimal restructuring.

This is a recommendation — the mobile dev may have personal preferences. The goal is to give every screen, hook, and component a predictable home so the API contract maps cleanly to code.

## File tree

```
scount-mobile/
├── app/                                    # Expo Router — file-based screens
│   ├── _layout.tsx                         # Root: theme provider, query client, splash gate, deep-link handler
│   ├── index.tsx                           # Splash (Screen 01) — 5s token validation then routes
│   ├── +not-found.tsx
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx                     # Stack with no tab bar
│   │   ├── login.tsx                       # Screen 02
│   │   └── workspace-select.tsx            # Screen 03
│   │
│   └── (tabs)/
│       ├── _layout.tsx                     # 5-tab bar: Home · Quotation · Invoice · Contacts · More
│       │
│       ├── index.tsx                       # Home — Screen 04 dashboard
│       │
│       ├── quotations/
│       │   ├── index.tsx                   # 05A list
│       │   ├── new.tsx                     # 05C create
│       │   └── [id]/
│       │       ├── index.tsx               # 05B detail
│       │       └── edit.tsx                # 05C reused with pre-filled values
│       │
│       ├── invoices/
│       │   ├── index.tsx                   # 06A list
│       │   ├── new.tsx                     # 06C create
│       │   └── [id]/
│       │       ├── index.tsx               # 06B detail
│       │       └── edit.tsx
│       │
│       ├── contacts/
│       │   ├── index.tsx                   # 07A list (Clients/Suppliers segmented)
│       │   ├── new.tsx                     # 07C create
│       │   └── [id]/
│       │       ├── index.tsx               # 07B detail
│       │       └── edit.tsx
│       │
│       └── more/
│           ├── index.tsx                   # 08A More menu
│           ├── notifications.tsx           # 08B inbox (also reachable from dashboard bell)
│           ├── profile.tsx                 # Edit name / password / photo
│           └── settings/
│               ├── appearance.tsx          # Light / Dark / System
│               └── notifications.tsx       # Per-category mute toggles (08C)
│
├── src/
│   ├── api/                                # Network layer — one module per resource
│   │   ├── client.ts                       # axios instance + auth/refresh interceptor
│   │   ├── auth.ts                         # login · logout · refresh · me
│   │   ├── workspaces.ts                   # list · detail (with settings) · select
│   │   ├── dashboard.ts
│   │   ├── quotations.ts                   # list · get · create · update · destroy · accept · decline · convert · pdf
│   │   ├── invoices.ts                     # list · get · create · update · destroy · pdf  (no payments, no reminders)
│   │   ├── contacts.ts
│   │   ├── devices.ts                      # register / deregister Expo push token
│   │   └── version.ts
│   │
│   ├── hooks/                              # TanStack Query wrappers
│   │   ├── useAuth.ts                      # useLogin · useLogout · useMe
│   │   ├── useWorkspace.ts                 # useActiveWorkspace · useSelectWorkspace
│   │   ├── useDashboard.ts
│   │   ├── useQuotations.ts                # useQuotationList · useQuotation · useCreateQuotation · useUpdateQuotation · useDeleteQuotation · useConvertToInvoice
│   │   ├── useInvoices.ts                  # similar set, no record-payment
│   │   ├── useContacts.ts
│   │   └── useNotifications.ts
│   │
│   ├── stores/                             # Zustand UI/session state (NOT server state)
│   │   ├── auth.ts                         # token, biometric-enabled flag
│   │   ├── workspace.ts                    # active workspace + cached settings (drives tax UI)
│   │   ├── theme.ts                        # 'light' | 'dark' | 'system'
│   │   └── ui.ts                           # filter pill selection per list, segmented choice on contacts, etc.
│   │
│   ├── components/
│   │   ├── ui/                             # Primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── SegmentedControl.tsx        # used by Contacts list and Contact create
│   │   │   ├── StatusPill.tsx              # OPEN/ACCEPTED/PAID/OVERDUE etc. — one component, status-driven colours
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toggle.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── ScreenHeader.tsx            # back · title · trailing actions
│   │   │   ├── ActionBar.tsx               # the bottom-stacked sticky bar above the tab bar
│   │   │   └── PullToRefresh.tsx
│   │   │
│   │   ├── shared/                         # Cross-resource pieces
│   │   │   ├── LineItemEditor.tsx          # used by both Quotation and Invoice create/edit
│   │   │   ├── AdditionalInfoFields.tsx    # delivery_days · terms · remarks · internal_remarks
│   │   │   ├── TaxAwareTotal.tsx           # renders Tax row only when workspace.settings.tax_enabled
│   │   │   ├── ContactPicker.tsx           # bottom-sheet contact search
│   │   │   └── ShareSheet.tsx              # OS share with the share_url + PDF
│   │   │
│   │   ├── quotation/
│   │   │   ├── QuotationListItem.tsx
│   │   │   ├── QuotationForm.tsx           # used by both `new.tsx` and `edit.tsx`
│   │   │   └── ConvertToInvoiceButton.tsx  # ACCEPTED-state primary CTA
│   │   │
│   │   ├── invoice/
│   │   │   ├── InvoiceListItem.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── PaymentsBlock.tsx           # READ-ONLY — "Web only" badge baked in
│   │   │   ├── UpcomingCyclesCard.tsx      # only renders when recurrence !== null
│   │   │   └── LineagePill.tsx             # "From QT-031 →" + "Recurring · monthly"
│   │   │
│   │   ├── contact/
│   │   │   ├── ContactListItem.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── ContactDetailHeader.tsx     # avatar + name + type pill
│   │   │
│   │   └── tabs/
│   │       └── BottomTabBar.tsx            # custom render for Material 3 dynamic-colour blending on Android 12+
│   │
│   ├── theme/
│   │   ├── colors.ts                       # moss + ink palettes
│   │   ├── typography.ts                   # Inter + JetBrains Mono scales
│   │   ├── spacing.ts
│   │   ├── radii.ts
│   │   ├── shadows.ts
│   │   └── index.ts                        # exports the merged theme + light/dark variants
│   │
│   ├── lib/
│   │   ├── money.ts                        # format(amount_minor, currency, locale) → "RM 12,400.00"
│   │   ├── dates.ts                        # parseISO, format, relative ("2h ago")
│   │   ├── biometric.ts                    # expo-local-authentication wrapper + capability detection
│   │   ├── secureStore.ts                  # expo-secure-store wrapper for the Sanctum token
│   │   ├── pushNotifications.ts            # registration + tap → deep-link routing
│   │   ├── deepLinks.ts                    # scount.my/q/<token> and scount.my/i/<token> handlers
│   │   ├── analytics.ts                    # PostHog wrapper (no-op when disabled)
│   │   └── sentry.ts                       # crash reporting init
│   │
│   ├── types/
│   │   ├── api.ts                          # generated from openapi.yaml via openapi-typescript (or hand-rolled)
│   │   ├── workspace.ts                    # Settings, TaxCode
│   │   ├── quotation.ts
│   │   ├── invoice.ts
│   │   └── contact.ts
│   │
│   └── i18n/
│       └── en.json                         # English-only on v1; structure ready for BM in Phase 3
│
├── assets/
│   ├── icon.png                            # 1024×1024 master
│   ├── splash.png
│   ├── adaptive-icon.png                   # Android foreground
│   ├── notification-icon.png               # Android push icon (mono)
│   └── fonts/
│       ├── Inter-Regular.ttf
│       ├── Inter-Medium.ttf
│       ├── Inter-SemiBold.ttf
│       ├── Inter-Bold.ttf
│       └── JetBrainsMono-Medium.ttf
│
├── .gitignore
├── .easignore
├── .prettierrc
├── app.config.ts                           # Expo config — TS for env interpolation
├── eas.json                                # EAS Build/Submit profiles
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json                           # strict: true
└── README.md
```

## `package.json` highlights

```jsonc
{
  "name": "scount-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start":  "expo start",
    "ios":    "expo run:ios",
    "android":"expo run:android",
    "lint":   "eslint .",
    "type":   "tsc --noEmit",
    "test":   "jest",
    "api:types": "openapi-typescript ../scount_app/docs/openapi.yaml -o src/types/api.ts"
  },
  "dependencies": {
    "expo":                                "~52.0.0",
    "expo-router":                         "~4.0.0",
    "expo-secure-store":                   "~14.0.0",
    "expo-local-authentication":           "~15.0.0",
    "expo-notifications":                  "~0.29.0",
    "expo-updates":                        "~0.26.0",
    "expo-system-ui":                      "~4.0.0",
    "expo-web-browser":                    "~14.0.0",
    "react":                               "18.3.1",
    "react-native":                        "0.76.0",
    "@tanstack/react-query":               "^5.0.0",
    "zustand":                             "^5.0.0",
    "axios":                               "^1.7.0",
    "nativewind":                          "^4.0.0",
    "tailwindcss":                         "^3.4.0",
    "react-native-reanimated":             "~3.16.0",
    "react-native-gesture-handler":        "~2.20.0",
    "react-native-safe-area-context":      "~4.12.0",
    "react-native-screens":                "~4.1.0",
    "react-native-svg":                    "15.8.0",
    "@sentry/react-native":                "^6.0.0",
    "date-fns":                            "^4.0.0",
    "zod":                                 "^3.23.0"
  },
  "devDependencies": {
    "@types/react":                        "~18.3.0",
    "typescript":                          "^5.6.0",
    "openapi-typescript":                  "^7.0.0",
    "eslint":                              "^9.0.0",
    "eslint-config-expo":                  "~8.0.0",
    "prettier":                            "^3.0.0",
    "jest":                                "^29.0.0",
    "jest-expo":                           "~52.0.0",
    "@testing-library/react-native":       "^12.0.0"
  }
}
```

`openapi-typescript` regenerates `src/types/api.ts` from the canonical YAML so types and contract never drift.

## `app.config.ts` skeleton

```ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'scount.my',
  slug: 'scount-mobile',
  version: '1.0.0',
  scheme: 'scount',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#FFFFFF' },
  ios: {
    bundleIdentifier: 'my.scount.mobile',
    supportsTablet: false,
    associatedDomains: ['applinks:scount.my'],
  },
  android: {
    package: 'my.scount.mobile',
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#10B981' },
    intentFilters: [
      { action: 'VIEW', category: ['BROWSABLE', 'DEFAULT'],
        data: [{ scheme: 'https', host: 'scount.my', pathPrefix: '/q/' },
               { scheme: 'https', host: 'scount.my', pathPrefix: '/i/' }],
        autoVerify: true },
    ],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-local-authentication',
    ['expo-notifications', { icon: './assets/notification-icon.png', color: '#10B981' }],
    'expo-updates',
    '@sentry/react-native/expo',
  ],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.scount.my',
    sentryDsn:  process.env.SENTRY_DSN,
  },
  experiments: { typedRoutes: true },
};

export default config;
```

`apiBaseUrl` switches between `api.scount.my`, `api.scount.ink` (staging), and `scount.test/api` (local Herd) via the EAS profile.

## `src/api/client.ts` — axios with auth + refresh

```ts
import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';
import { secureStore } from '@/lib/secureStore';
import { useAuthStore } from '@/stores/auth';

const baseURL = Constants.expoConfig?.extra?.apiBaseUrl;

export const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await secureStore.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    if (err.response?.status === 401) {
      // token expired or revoked — kick to login
      await useAuthStore.getState().clear();
    }
    return Promise.reject(err);
  },
);
```

## Sample TanStack Query hook — `useQuotations.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/quotations';
import type { Quotation, QuotationInput } from '@/types/api';

export const useQuotationList = (status: string = 'open') =>
  useQuery({
    queryKey: ['quotations', status],
    queryFn: () => api.list({ status }),
  });

export const useQuotation = (id: string) =>
  useQuery({
    queryKey: ['quotations', id],
    queryFn: () => api.get(id),
    enabled: !!id,
  });

export const useCreateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: QuotationInput) => api.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
};

export const useConvertToInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quotationId: string) => api.convertToInvoice(quotationId),
    onSuccess: (_, quotationId) => {
      qc.invalidateQueries({ queryKey: ['quotations', quotationId] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
```

## Sample workspace store — `src/stores/workspace.ts`

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Workspace } from '@/types/api';
import { secureStore } from '@/lib/secureStore';

interface WorkspaceState {
  active: Workspace | null;
  setActive: (w: Workspace) => void;
  // Tax UI reads from this — single source of truth for the conditional rendering
  taxEnabled: () => boolean;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      active: null,
      setActive: (w) => set({ active: w }),
      taxEnabled: () => get().active?.settings.tax_enabled ?? false,
    }),
    {
      name: 'workspace',
      storage: createJSONStorage(() => secureStore),
    },
  ),
);
```

## Tax-aware totals — `src/components/shared/TaxAwareTotal.tsx`

```tsx
import { View, Text } from 'react-native';
import { useWorkspaceStore } from '@/stores/workspace';
import { formatMoney } from '@/lib/money';

export const TaxAwareTotal = ({
  subtotal_minor,
  tax_minor,
  total_minor,
  currency,
}: {
  subtotal_minor: number;
  tax_minor: number;
  total_minor: number;
  currency: string;
}) => {
  const taxEnabled = useWorkspaceStore((s) => s.taxEnabled());

  return (
    <View className="rounded-2xl bg-moss-500 p-4">
      <Text className="text-white/80 text-xs uppercase">Total</Text>
      <Text className="text-white text-2xl font-bold">
        {formatMoney(total_minor, currency)}
      </Text>

      <View className="flex-row justify-between mt-1">
        <Text className="text-white/85 text-[10px]">
          Subtotal {formatMoney(subtotal_minor, currency)}
        </Text>
        {taxEnabled && (
          <Text className="text-white/85 text-[10px]">
            Tax {formatMoney(tax_minor, currency)}
          </Text>
        )}
      </View>
    </View>
  );
};
```

The whole tax-follows-web rule lives in **one** `taxEnabled` selector. Every screen that needs to know reads from there; if web flips the workspace setting, the next dashboard refresh updates the store and every mounted total re-renders.

## Money formatter — `src/lib/money.ts`

```ts
const formatters = new Map<string, Intl.NumberFormat>();

const fmtFor = (currency: string, locale = 'en-MY') => {
  const key = `${locale}:${currency}`;
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }));
  }
  return formatters.get(key)!;
};

/** amount_minor + currency → display string. Never use floats anywhere else. */
export const formatMoney = (amount_minor: number, currency: string, locale?: string) =>
  fmtFor(currency, locale).format(amount_minor / 100);
```

## Tab layout — `app/(tabs)/_layout.tsx`

```tsx
import { Tabs } from 'expo-router';
import { Home, FileText, Receipt, Users, MoreHorizontal } from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   colors.moss[700],
        tabBarInactiveTintColor: colors.slate[400],
        tabBarLabelStyle:        { fontSize: 9, fontWeight: '600' },
        headerShown:             false,
      }}
    >
      <Tabs.Screen name="index"      options={{ title: 'Home',      tabBarIcon: ({ color }) => <Home size={16} color={color} /> }} />
      <Tabs.Screen name="quotations" options={{ title: 'Quotation', tabBarIcon: ({ color }) => <FileText size={16} color={color} /> }} />
      <Tabs.Screen name="invoices"   options={{ title: 'Invoice',   tabBarIcon: ({ color }) => <Receipt size={16} color={color} /> }} />
      <Tabs.Screen name="contacts"   options={{ title: 'Contacts',  tabBarIcon: ({ color }) => <Users size={16} color={color} /> }} />
      <Tabs.Screen name="more"       options={{ title: 'More',      tabBarIcon: ({ color }) => <MoreHorizontal size={16} color={color} /> }} />
    </Tabs>
  );
}
```

## Conventions worth keeping consistent

1. **Server state in TanStack Query, UI state in Zustand.** Never store API responses in Zustand — that's how you end up with stale data races. The workspace settings are the one exception, since they drive UI rendering and need synchronous access.
2. **Money is `amount_minor` + `currency` end-to-end.** No floats anywhere, including in component props. `formatMoney` is the only place those touch screen.
3. **Forms reuse one component for new + edit.** `QuotationForm`, `InvoiceForm`, `ContactForm` each accept an optional `initialValue` prop. The `[id]/edit.tsx` route fetches the resource and passes it in; `new.tsx` doesn't.
4. **Status pills are status-driven, not state-driven.** `<StatusPill status="overdue" />` knows its own colours and label. Don't pass colour props.
5. **Tab bar always visible on the (tabs) group.** Per the design rule. The action bars on detail/create screens stack above the tab bar at `bottom-[57px]` rather than replacing it.
6. **No record-payment, no record-reminder code paths exist on mobile.** The endpoints aren't exposed and the UI components don't ship. If a backend developer ever exposes `POST /v1/invoices/{id}/payments` on the mobile token by accident, the mobile app still won't call it.
7. **OpenAPI as source of truth for types.** `npm run api:types` regenerates `src/types/api.ts`. CI runs it and fails the build if the generated file isn't committed clean — keeps the contract honest.
8. **Deep links go through `lib/deepLinks.ts`.** `scount.my/q/<token>` opens the quote detail; `scount.my/i/<token>` opens the invoice detail. Both round-trip through Expo Router so the back-stack is correct.

## Mobile dev's checklist (to hand off)

- [ ] `npx create-expo-app@latest scount-mobile --template tabs`
- [ ] Replace generated `app/` with the structure above
- [ ] Install dependencies from the `package.json` highlights
- [ ] Configure `app.config.ts` with bundle IDs + plugin block
- [ ] Configure `eas.json` with development / preview / production profiles
- [ ] Drop the `moss` + `ink` palette into `src/theme/colors.ts`
- [ ] Wire NativeWind so the existing tailwind class names from the mockups port across
- [ ] Generate `src/types/api.ts` from `docs/openapi.yaml`
- [ ] Implement `src/api/client.ts` with the axios + auth interceptor pattern
- [ ] Build the auth flow (Splash → Login → Workspace-select → Dashboard) end-to-end against a stubbed backend before touching list/detail screens
- [ ] Build one resource end-to-end (suggest **Quotation**) — list, detail, create, edit, delete, convert — to validate the patterns before parallelising
- [ ] Wire push notifications with `expo-notifications` + tap → deep-link routing
- [ ] Sentry init, crash testing on both platforms
- [ ] EAS Build + internal-testing distribution working

When the auth flow + Quotation resource are both real and the dashboard renders against live `api.scount.my` data, the rest of v1 is mostly mechanical replication of those patterns.
