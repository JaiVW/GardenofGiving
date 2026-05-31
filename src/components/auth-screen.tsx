import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { GardenColors, GardenShadow } from '@/constants/garden-theme';
import { supabase } from '@/lib/supabase';

type AuthMode = 'welcome' | 'signup' | 'login';

function getEmailRedirectTo() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location.origin;
}

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSendLink() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setMessage(null);
    setIsSending(true);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
        shouldCreateUser: true,
      },
    });

    setIsSending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage(`A link is on its way to ${trimmedEmail}.`);
  }

  const isSignup = mode === 'signup';
  const isLogin = mode === 'login';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.ambientOne} />
      <View style={styles.ambientTwo} />
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <View style={[styles.brandPetal, styles.brandPetalOne]} />
            <View style={[styles.brandPetal, styles.brandPetalTwo]} />
            <View style={styles.brandSeed} />
          </View>
          <ThemedText style={styles.brandText}>Garden of Giving</ThemedText>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.brandOrb}>
          <View style={[styles.brandPetal, styles.orbPetalOne]} />
          <View style={[styles.brandPetal, styles.orbPetalTwo]} />
          <View style={styles.orbSeed} />
        </View>
        <ThemedText type="title" style={styles.title}>
          {isLogin ? 'Welcome back' : isSignup ? 'Begin a new garden' : 'Garden of Giving'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isLogin
            ? "Enter your email and we'll send a link to your garden."
            : isSignup
              ? "Enter your email and we'll send a link to start."
              : 'Creating conditions where goodness can flourish.'}
        </ThemedText>

        {mode === 'welcome' ? (
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => setMode('signup')} style={styles.primaryButton}>
              <ThemedText type="smallBold" style={styles.primaryButtonText}>
                Begin a new garden
              </ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setMode('login')} style={styles.secondaryButton}>
              <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                Return to your garden
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <ThemedText type="smallBold" style={styles.label}>
              Your email
            </ThemedText>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              inputMode="email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={GardenColors.inkSoft}
              style={styles.input}
              value={email}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isSending}
              onPress={handleSendLink}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                isSending && styles.disabled,
              ]}>
              {isSending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Send me a link
                </ThemedText>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMode(isLogin ? 'signup' : 'login');
                setError(null);
                setMessage(null);
              }}>
              <ThemedText type="small" style={styles.fine}>
                {isLogin ? 'New here? Begin a new garden' : 'Already have a garden? Log in'}
              </ThemedText>
            </Pressable>
          </View>
        )}

        {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
        {error ? (
          <ThemedText type="smallBold" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: GardenColors.bg,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 16,
  },
  ambientOne: {
    backgroundColor: 'rgba(183,217,196,0.32)',
    borderRadius: 240,
    height: 480,
    left: -160,
    position: 'absolute',
    top: -90,
    width: 480,
  },
  ambientTwo: {
    backgroundColor: 'rgba(155,120,186,0.14)',
    borderRadius: 260,
    height: 520,
    position: 'absolute',
    right: -190,
    top: 110,
    width: 520,
  },
  header: {
    left: 16,
    position: 'absolute',
    top: 18,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandText: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 18,
  },
  brandMark: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: GardenColors.line,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    position: 'relative',
    width: 32,
  },
  brandOrb: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: GardenColors.line,
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    marginBottom: 16,
    position: 'relative',
    width: 42,
  },
  brandPetal: {
    borderRadius: 10,
    height: 13,
    position: 'absolute',
    top: 10,
    width: 13,
  },
  brandPetalOne: {
    backgroundColor: GardenColors.teal,
    left: 7,
  },
  brandPetalTwo: {
    backgroundColor: GardenColors.sage,
    right: 7,
  },
  brandSeed: {
    backgroundColor: GardenColors.claySoft,
    borderRadius: 4,
    bottom: 8,
    height: 8,
    left: 12,
    position: 'absolute',
    width: 8,
  },
  orbPetalOne: {
    backgroundColor: GardenColors.teal,
    left: 10,
    top: 14,
  },
  orbPetalTwo: {
    backgroundColor: GardenColors.sage,
    right: 10,
    top: 13,
  },
  orbSeed: {
    backgroundColor: GardenColors.claySoft,
    borderRadius: 5,
    bottom: 10,
    height: 10,
    left: 16,
    position: 'absolute',
    width: 10,
  },
  card: {
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 560,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingVertical: 34,
    width: '100%',
    ...GardenShadow,
  },
  title: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 42,
    fontWeight: '400',
    lineHeight: 44,
    textAlign: 'center',
  },
  subtitle: {
    color: GardenColors.inkSoft,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 24,
  },
  form: {
    gap: 10,
    marginTop: 24,
  },
  label: {
    color: GardenColors.inkSoft,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: GardenColors.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: GardenColors.mintDeep,
    borderColor: 'rgba(46,102,89,0.4)',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,253,249,0.78)',
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: GardenColors.ink,
  },
  fine: {
    color: GardenColors.inkSoft,
    marginTop: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  message: {
    color: GardenColors.mintDeep,
    marginTop: 18,
    textAlign: 'center',
  },
  error: {
    color: '#B42318',
    marginTop: 18,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.6,
  },
});
