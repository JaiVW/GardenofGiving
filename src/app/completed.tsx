import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { formatDateLabel, getCompletedTasks, TaskHistoryItem } from '@/lib/gog';

export default function CompletedScreen() {
  const { isLoading: isAuthLoading, session } = useAuth();
  const [tasks, setTasks] = useState<TaskHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = session?.user.id;

  const loadTasks = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    setTasks(await getCompletedTasks(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [loadTasks]);

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
            <ThemedText type="smallBold" style={styles.kicker}>
              Completed
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {tasks.length} completed day{tasks.length === 1 ? '' : 's'}
            </ThemedText>
          </View>

          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.list}>
              {tasks.length ? (
                tasks.map((task) => (
                  <ThemedView key={task.date} type="backgroundElement" style={styles.timelineCard}>
                    <View style={styles.dot} />
                    <View style={styles.taskCopy}>
                      <ThemedText type="smallBold">{formatDateLabel(task.date)}</ThemedText>
                      <ThemedText>{task.text}</ThemedText>
                    </View>
                  </ThemedView>
                ))
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  Completed tasks will appear here after you mark an invitation done.
                </ThemedText>
              )}
            </View>
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
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    paddingTop: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  kicker: {
    color: '#2E6659',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  list: {
    gap: Spacing.two,
  },
  timelineCard: {
    alignItems: 'flex-start',
    borderRadius: Spacing.two,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  dot: {
    backgroundColor: '#E95732',
    borderRadius: 8,
    height: 16,
    marginTop: 4,
    width: 16,
  },
  taskCopy: {
    flex: 1,
    gap: Spacing.one,
  },
});
