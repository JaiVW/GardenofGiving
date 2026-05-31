import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

function getEmailRedirectTo() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location.origin;
}

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSendLink() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Enter a valid email address.');
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

    setMessage('Check your email for a magic link to open your garden.');
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.brandMark} />
        <ThemedText type="title" style={styles.title}>
          Garden of Giving
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.copy}>
          Begin a new garden or return to your existing one with an email magic link.
        </ThemedText>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          inputMode="email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#706A60"
          style={styles.input}
          value={email}
        />

        <Pressable
          accessibilityRole="button"
          disabled={isSending}
          onPress={handleSendLink}
          style={({ pressed }) => [styles.button, pressed && styles.pressed, isSending && styles.disabled]}>
          {isSending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText type="smallBold" style={styles.buttonText}>
              Send magic link
            </ThemedText>
          )}
        </Pressable>

        {message ? <ThemedText type="small">{message}</ThemedText> : null}
        {error ? (
          <ThemedText type="smallBold" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    backgroundColor: 'rgba(255,253,249,0.9)',
    borderColor: 'rgba(46,42,34,0.13)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    gap: Spacing.three,
    maxWidth: 520,
    padding: Spacing.five,
    width: '100%',
  },
  brandMark: {
    backgroundColor: '#B7D9C4',
    borderColor: 'rgba(46,42,34,0.13)',
    borderRadius: 24,
    borderWidth: 1,
    height: 42,
    width: 42,
  },
  title: {
    fontSize: 38,
    lineHeight: 42,
  },
  copy: {
    maxWidth: 420,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8C9B7',
    borderRadius: Spacing.two,
    borderWidth: 1,
    color: '#171716',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2E6659',
    borderRadius: Spacing.two,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: '#B42318',
  },
});
