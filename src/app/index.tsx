import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { createGardenNote, GardenNote, listGardenNotes } from '@/lib/garden-notes';

export default function HomeScreen() {
  const [notes, setNotes] = useState<GardenNote[]>([]);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      setNotes(await listGardenNotes());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load notes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadNotes();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [loadNotes]);

  async function handleCreateNote() {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const note = await createGardenNote(trimmedBody);
      setNotes((currentNotes) => [note, ...currentNotes]);
      setBody('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save note.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Garden of Giving
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            A first Supabase connection test for shared notes.
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.form}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write a note for the garden"
            placeholderTextColor="#60646C"
            multiline
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            disabled={isSaving || body.trim().length === 0}
            onPress={handleCreateNote}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              (isSaving || body.trim().length === 0) && styles.buttonDisabled,
            ]}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              {isSaving ? 'Saving...' : 'Save note'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {error ? (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="smallBold">Supabase needs one more step</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
          </ThemedView>
        ) : null}

        <View style={styles.listHeader}>
          <ThemedText type="smallBold">Latest notes</ThemedText>
          <Pressable accessibilityRole="button" onPress={loadNotes} disabled={isLoading}>
            <ThemedText type="linkPrimary">{isLoading ? 'Refreshing' : 'Refresh'}</ThemedText>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <ScrollView contentContainerStyle={styles.list} style={styles.scroller}>
            {notes.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                No notes yet.
              </ThemedText>
            ) : (
              notes.map((note) => (
                <ThemedView key={note.id} type="backgroundElement" style={styles.note}>
                  <ThemedText>{note.body}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {new Date(note.createdAt).toLocaleString()}
                  </ThemedText>
                </ThemedView>
              ))
            )}
          </ScrollView>
        )}

        <ThemedText type="code" style={styles.footer}>
          Supabase table: garden_notes
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.five,
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  subtitle: {
    maxWidth: 520,
  },
  form: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  input: {
    minHeight: 96,
    borderRadius: Spacing.two,
    borderColor: '#B7BBC4',
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
    padding: Spacing.three,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1D6F42',
    borderRadius: Spacing.two,
    minWidth: 128,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  errorBox: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderColor: '#B42318',
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scroller: {
    flex: 1,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  note: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  footer: {
    textTransform: 'uppercase',
  },
});
