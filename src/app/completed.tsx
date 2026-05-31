import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { GardenColors, GardenSoftShadow } from '@/constants/garden-theme';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { formatDateLabel, getCompletedTasks, TaskHistoryItem } from '@/lib/gog';

function SeedMark() {
  return (
    <View style={styles.seedMark}>
      <View style={styles.seedStem} />
      <View style={[styles.seedLeaf, styles.seedLeafLeft]} />
      <View style={[styles.seedLeaf, styles.seedLeafRight]} />
    </View>
  );
}

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
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
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
          <View style={styles.loadingPanel}>
            <ActivityIndicator />
          </View>
        ) : tasks.length ? (
          <View style={styles.timeline}>
            <View style={styles.timelineLine} />
            {tasks.map((task, index) => (
              <View key={task.date} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    index % 4 === 1 && styles.dotLavender,
                    index % 4 === 2 && styles.dotMint,
                    index % 4 === 3 && styles.dotViolet,
                  ]}
                />
                <View style={styles.timelineCard}>
                  <View style={styles.taskCopy}>
                    <ThemedText type="smallBold" style={styles.taskDate}>
                      {formatDateLabel(task.date)}
                    </ThemedText>
                    <ThemedText style={styles.taskText}>{task.text}</ThemedText>
                    <View style={styles.stageRow}>
                      <SeedMark />
                      <ThemedText type="smallBold" style={styles.stageLabel}>
                        Seed
                      </ThemedText>
                    </View>
                  </View>
                  <SeedMark />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <ThemedText style={styles.emptyNote}>
              Completed tasks will appear here after you mark an invitation done.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: GardenColors.bg,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: GardenColors.bg,
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset + 36,
    paddingHorizontal: 16,
    paddingTop: 88,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  kicker: {
    color: GardenColors.inkSoft,
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 42,
    fontWeight: '400',
    lineHeight: 46,
    textAlign: 'center',
  },
  loadingPanel: {
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'center',
  },
  timeline: {
    paddingBottom: 6,
    paddingLeft: 28,
    position: 'relative',
  },
  timelineLine: {
    backgroundColor: 'rgba(121,105,91,0.25)',
    bottom: 20,
    left: 13,
    position: 'absolute',
    top: 18,
    width: 1,
  },
  timelineItem: {
    marginBottom: 18,
    position: 'relative',
  },
  timelineDot: {
    backgroundColor: GardenColors.clay,
    borderColor: 'rgba(255,255,255,0.64)',
    borderRadius: 14,
    borderWidth: 7,
    height: 28,
    left: -27,
    position: 'absolute',
    top: 20,
    width: 28,
    zIndex: 2,
    ...GardenSoftShadow,
  },
  dotLavender: {
    backgroundColor: GardenColors.lavender,
  },
  dotMint: {
    backgroundColor: GardenColors.teal,
  },
  dotViolet: {
    backgroundColor: GardenColors.violet,
  },
  timelineCard: {
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'space-between',
    minHeight: 124,
    overflow: 'hidden',
    padding: 20,
    ...GardenSoftShadow,
  },
  taskCopy: {
    flex: 1,
    gap: 6,
  },
  taskDate: {
    color: GardenColors.inkSoft,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  taskText: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 20,
    lineHeight: 26,
  },
  stageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 4,
  },
  stageLabel: {
    color: GardenColors.mintDeep,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  seedMark: {
    height: 72,
    opacity: 0.68,
    position: 'relative',
    width: 72,
  },
  seedStem: {
    backgroundColor: GardenColors.mintDeep,
    borderRadius: 3,
    bottom: 10,
    height: 46,
    left: 34,
    position: 'absolute',
    width: 5,
  },
  seedLeaf: {
    backgroundColor: GardenColors.mintDeep,
    borderRadius: 18,
    height: 30,
    position: 'absolute',
    top: 22,
    width: 22,
  },
  seedLeafLeft: {
    left: 16,
    transform: [{ rotate: '-34deg' }],
  },
  seedLeafRight: {
    right: 15,
    top: 16,
    transform: [{ rotate: '34deg' }],
  },
  emptyCard: {
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 22,
    ...GardenSoftShadow,
  },
  emptyNote: {
    color: GardenColors.inkSoft,
    lineHeight: 22,
  },
});
