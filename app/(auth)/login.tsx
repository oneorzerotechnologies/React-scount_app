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

import { Colors, moss, slate } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Login() {
  const router  = useRouter();
  const palette = Colors[useColorScheme() ?? 'light'];

  const [email,    setEmail]    = useState('eva@acme.co');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = () => {
    setSubmitting(true);
    // v0: no real auth yet. Hold for ~600ms so the press registers visually.
    setTimeout(() => {
      setSubmitting(false);
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand mark */}
          <View style={styles.brandPill}>
            <Text style={styles.brandGlyph}>$</Text>
          </View>

          <Text style={[styles.title, { color: palette.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Sign in to your scount.my workspace.
          </Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>EMAIL</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.co"
              placeholderTextColor={slate[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.textMuted }]}>PASSWORD</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={slate[400]}
              secureTextEntry
              style={[styles.input, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]}
            />
            <View style={styles.forgotRow}>
              <Pressable hitSlop={8}>
                <Text style={[styles.forgot, { color: moss[700] }]}>Forgot password?</Text>
              </Pressable>
            </View>
          </View>

          {/* Sign in */}
          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: submitting ? 0.6 : pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.primaryBtnText}>{submitting ? 'Signing in…' : 'Sign in'}</Text>
          </Pressable>

          {/* Biometric (placeholder, mocked to do the same thing) */}
          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: palette.border, backgroundColor: palette.surface, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: palette.text }]}>Use Face ID</Text>
          </Pressable>

          {/* Bottom CTA */}
          <View style={styles.bottom}>
            <Text style={[styles.bottomText, { color: palette.textMuted }]}>
              New to scount.my?{' '}
              <Text style={{ color: moss[700], fontWeight: '600' }}>Create an account</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 16 },

  brandPill: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: moss[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: moss[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  brandGlyph: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: -3 },

  title:    { marginTop: 24, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { marginTop: 4,  fontSize: 14 },

  field: { marginTop: 20 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  forgotRow: { alignItems: 'flex-end', marginTop: 6 },
  forgot:   { fontSize: 12, fontWeight: '600' },

  primaryBtn: {
    marginTop: 24,
    backgroundColor: moss[500],
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: moss[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  secondaryBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },

  bottom:    { marginTop: 'auto', paddingTop: 24, alignItems: 'center' },
  bottomText:{ fontSize: 13 },
});
