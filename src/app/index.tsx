import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import {
  formatDateLabel,
  getTodayState,
  saveCheckin,
  setEmailNotificationsEnabled,
  TodayState,
  todayKey,
} from '@/lib/gog';

export default function HomeScreen() {
  const { isLoading: isAuthLoading, session, signOut } = useAuth();
  const [todayState, setTodayState] = useState<TodayState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = session?.user.id;
  const email = session?.user.email ?? '';

  const loadToday = useCallback(async () => {
    if (!userId) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      setTodayState(await getTodayState(userId, email));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load your garden.');
    } finally {
      setIsLoading(false);
    }
  }, [email, userId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadToday();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [loadToday]);

  async function handleCheckin(completed: boolean) {
    if (!userId) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await saveCheckin(userId, completed);
      await loadToday();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save your answer.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleNotifications(enabled: boolean) {
    if (!userId || !todayState) {
      return;
    }

    setTodayState({ ...todayState, emailNotificationsEnabled: enabled });
    try {
      await setEmailNotificationsEnabled(userId, enabled);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Could not update email reminders.'
      );
      setTodayState({ ...todayState, emailNotificationsEnabled: !enabled });
    }
  }

  if (isAuthLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <ThemedText type="smallBold" style={styles.kicker}>
                Today&apos;s invitation
              </ThemedText>
              <ThemedText type="title" style={styles.title}>
                Garden of Giving
              </ThemedText>
            </View>
            <Pressable accessibilityRole="button" onPress={signOut}>
              <ThemedText type="linkPrimary">Sign out</ThemedText>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <ThemedView type="backgroundElement" style={styles.todayPanel}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {formatDateLabel(todayKey())}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.challenge}>
                  {todayState?.challenge?.text ?? 'The garden is resting today.'}
                </ThemedText>
                <View style={styles.checkinRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => handleCheckin(true)}
                    style={({ pressed }) => [
                      styles.choiceCard,
                      todayState?.completedToday === true && styles.choiceSelected,
                      pressed && styles.buttonPressed,
                    ]}>
                    <ThemedText type="smallBold">I did it</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => handleCheckin(false)}
                    style={({ pressed }) => [
                      styles.choiceCard,
                      todayState?.completedToday === false && styles.choiceSelected,
                      pressed && styles.buttonPressed,
                    ]}>
                    <ThemedText type="smallBold">Not today</ThemedText>
                  </Pressable>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {todayState?.completedToday === true
                    ? 'Thank you for tending the garden today.'
                    : todayState?.completedToday === false
                      ? 'Rest is part of the rhythm. You can change this today.'
                      : 'Choose an answer when you are ready.'}
                </ThemedText>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.summaryStrip}>
                <View>
                  <ThemedText type="subtitle">{todayState?.totalCompleted ?? 0}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    completed days
                  </ThemedText>
                </View>
                <View style={styles.toggleRow}>
                  <ThemedText type="smallBold">Daily email reminders</ThemedText>
                  <Switch
                    value={todayState?.emailNotificationsEnabled ?? true}
                    onValueChange={handleToggleNotifications}
                  />
                </View>
              </ThemedView>

              {error ? (
                <ThemedView type="backgroundElement" style={styles.errorBox}>
                  <ThemedText type="smallBold">Something needs attention</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {error}
                  </ThemedText>
                </ThemedView>
              ) : null}

              <View style={styles.listHeader}>
                <ThemedText type="smallBold">Recent tasks</ThemedText>
                <Pressable accessibilityRole="button" onPress={loadToday}>
                  <ThemedText type="linkPrimary">Refresh</ThemedText>
                </Pressable>
              </View>
              <View style={styles.list}>
                {todayState?.recentTasks.length ? (
                  todayState.recentTasks.map((task) => (
                    <ThemedView key={task.date} type="backgroundElement" style={styles.task}>
                      <View style={styles.taskCopy}>
                        <ThemedText type="smallBold">{formatDateLabel(task.date)}</ThemedText>
                        <ThemedText>{task.text}</ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {task.completed === true ? 'Done' : task.completed === false ? 'Skipped' : 'Open'}
                      </ThemedText>
                    </ThemedView>
                  ))
                ) : (
                  <ThemedText type="small" themeColor="textSecondary">
                    Your task history will appear after your first invitation.
                  </ThemedText>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    paddingTop: Spacing.five,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#2E6659',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  todayPanel: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.two,
  },
  challenge: {
    fontSize: 28,
    lineHeight: 34,
  },
  checkinRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  choiceCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8C9B7',
    borderRadius: Spacing.two,
    borderWidth: 1,
    flex: 1,
    minHeight: 72,
    justifyContent: 'center',
    padding: Spacing.three,
  },
  choiceSelected: {
    backgroundColor: '#B7D9C4',
    borderColor: '#2E6659',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  summaryStrip: {
    alignItems: 'center',
    borderRadius: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
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
  list: {
    gap: Spacing.two,
  },
  task: {
    alignItems: 'center',
    borderRadius: Spacing.two,
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
  taskCopy: {
    flex: 1,
    gap: Spacing.one,
  },
});
