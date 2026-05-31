import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { GardenColors, GardenShadow } from '@/constants/garden-theme';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import {
  addTestCompletedDay,
  formatDateLabel,
  getTodayState,
  saveCheckin,
  setEmailNotificationsEnabled,
  TodayState,
} from '@/lib/gog';

const todayFlower = require('@/assets/garden/today-flower.png');

function StageIcon() {
  return (
    <View style={styles.stageIcon}>
      <View style={styles.stageStem} />
      <View style={[styles.stageLeaf, styles.stageLeafLeft]} />
      <View style={[styles.stageLeaf, styles.stageLeafRight]} />
    </View>
  );
}

function StatusPill({ completed }: { completed: boolean | null }) {
  const label = completed === true ? 'Done' : completed === false ? 'Skipped' : 'Open';
  return (
    <View style={[styles.taskState, completed === true && styles.done, completed === false && styles.skipped]}>
      <ThemedText type="smallBold" style={[styles.taskStateText, completed === true && styles.doneText]}>
        {label}
      </ThemedText>
    </View>
  );
}

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

  async function handleAddTestDay() {
    if (!userId) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await addTestCompletedDay(userId);
      await loadToday();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not add a test day.');
    } finally {
      setIsSaving(false);
    }
  }

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

  const completedToday = todayState?.completedToday ?? null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.ambientOne} />
      <View style={styles.ambientTwo} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.signoutRow}>
          <Pressable accessibilityRole="button" onPress={signOut}>
            <ThemedText type="small" style={styles.signOut}>
              Sign out
            </ThemedText>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <View style={styles.todayPanel}>
              <View style={styles.todayCopy}>
                <ThemedText type="smallBold" style={styles.kicker}>
                  Today&apos;s invitation
                </ThemedText>
                <ThemedText type="title" style={styles.taskTitle}>
                  {todayState?.challenge?.text ?? 'No invitation today'}
                </ThemedText>
                <View style={styles.stageRow}>
                  <StageIcon />
                  <ThemedText type="smallBold" style={styles.stageLabel}>
                    Seed
                  </ThemedText>
                </View>
              </View>
              <View style={styles.todayArt}>
                <View style={styles.paperDiscOne} />
                <View style={styles.paperDiscTwo} />
                <Image accessibilityIgnoresInvertColors source={todayFlower} style={styles.todayFlower} />
              </View>
            </View>

            <View style={styles.checkinPanel}>
              {completedToday === null ? (
                <View style={styles.checkinForm}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => handleCheckin(true)}
                    style={({ pressed }) => [styles.choiceCard, styles.choiceYes, pressed && styles.pressed]}>
                    <View style={styles.choiceIcon}>
                      <View style={styles.choiceTick} />
                    </View>
                    <ThemedText style={styles.choiceText}>I did it</ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => handleCheckin(false)}
                    style={({ pressed }) => [styles.choiceCard, pressed && styles.pressed]}>
                    <View style={styles.choiceIcon}>
                      <View style={styles.choiceSlash} />
                    </View>
                    <ThemedText style={styles.choiceText}>Not today</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.statusBlock}>
                  <ThemedText style={[styles.status, completedToday === false && styles.statusMuted]}>
                    {completedToday
                      ? 'Thank you for tending the garden today.'
                      : 'Rest is part of the rhythm. See you tomorrow.'}
                  </ThemedText>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => handleCheckin(!completedToday)}>
                    <ThemedText style={styles.linkButton}>
                      {completedToday ? 'Change to not today' : 'Actually, I did it'}
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.summaryStrip}>
              <View style={styles.summaryRing} />
              <View>
                <ThemedText style={styles.summaryNumber}>{todayState?.totalCompleted ?? 0}</ThemedText>
                <ThemedText type="small" style={styles.summaryLabel}>
                  completed day{todayState?.totalCompleted === 1 ? '' : 's'}
                </ThemedText>
              </View>
              <ThemedText style={styles.summaryCopy}>You&apos;re growing something beautiful.</ThemedText>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={handleAddTestDay}
              style={({ pressed }) => [styles.testButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.testButtonText}>
                Add test completed day
              </ThemedText>
            </Pressable>

            <View style={styles.notificationSettings}>
              <ThemedText type="smallBold" style={styles.notificationText}>
                Daily email reminders
              </ThemedText>
              <Switch
                trackColor={{ false: GardenColors.sand, true: GardenColors.mintDeep }}
                thumbColor="#FFFFFF"
                value={todayState?.emailNotificationsEnabled ?? true}
                onValueChange={handleToggleNotifications}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <ThemedText type="smallBold" style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.listSection}>
              <View style={styles.sectionHeading}>
                <ThemedText style={styles.sectionTitle}>Recent tasks</ThemedText>
                <Pressable accessibilityRole="button" onPress={loadToday}>
                  <ThemedText type="smallBold" style={styles.sectionLink}>
                    Refresh
                  </ThemedText>
                </Pressable>
              </View>
              {todayState?.recentTasks.length ? (
                todayState.recentTasks.map((task) => (
                  <View key={task.date} style={styles.taskItem}>
                    <View style={styles.taskCopy}>
                      <ThemedText type="smallBold" style={styles.taskDate}>
                        {formatDateLabel(task.date)}
                      </ThemedText>
                      <ThemedText style={styles.taskText}>{task.text}</ThemedText>
                    </View>
                    <StatusPill completed={task.completed} />
                  </View>
                ))
              ) : (
                <ThemedText style={styles.emptyNote}>
                  Your task history will appear here after your first invitation.
                </ThemedText>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: GardenColors.bg,
    flex: 1,
    overflow: 'hidden',
  },
  ambientOne: {
    backgroundColor: 'rgba(183,217,196,0.25)',
    borderRadius: 260,
    height: 520,
    left: -210,
    position: 'absolute',
    top: -80,
    width: 520,
  },
  ambientTwo: {
    backgroundColor: 'rgba(110,167,162,0.18)',
    borderRadius: 260,
    bottom: -160,
    height: 520,
    position: 'absolute',
    right: -190,
    width: 520,
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
  signoutRow: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  signOut: {
    color: GardenColors.inkSoft,
  },
  loadingPanel: {
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  todayPanel: {
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 430,
    overflow: 'hidden',
    paddingHorizontal: 34,
    paddingVertical: 58,
    position: 'relative',
    ...GardenShadow,
  },
  todayCopy: {
    maxWidth: 500,
    zIndex: 2,
  },
  kicker: {
    color: GardenColors.inkSoft,
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  taskTitle: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 46,
    fontWeight: '400',
    lineHeight: 52,
    marginBottom: 24,
  },
  stageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  stageLabel: {
    color: GardenColors.mintDeep,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  stageIcon: {
    height: 26,
    position: 'relative',
    width: 28,
  },
  stageStem: {
    backgroundColor: GardenColors.mintDeep,
    borderRadius: 2,
    bottom: 1,
    height: 18,
    left: 13,
    position: 'absolute',
    width: 3,
  },
  stageLeaf: {
    backgroundColor: GardenColors.mintDeep,
    borderRadius: 9,
    height: 15,
    position: 'absolute',
    top: 4,
    width: 12,
  },
  stageLeafLeft: {
    left: 4,
    transform: [{ rotate: '-24deg' }],
  },
  stageLeafRight: {
    right: 3,
    transform: [{ rotate: '24deg' }],
  },
  todayArt: {
    bottom: -42,
    height: 360,
    opacity: 0.74,
    position: 'absolute',
    right: -58,
    width: 360,
  },
  todayFlower: {
    bottom: 0,
    height: 290,
    position: 'absolute',
    right: 0,
    resizeMode: 'contain',
    width: 290,
  },
  paperDiscOne: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: 118,
    borderWidth: 1,
    bottom: 24,
    height: 236,
    position: 'absolute',
    right: 0,
    width: 236,
  },
  paperDiscTwo: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: 85,
    borderWidth: 1,
    bottom: 0,
    height: 170,
    position: 'absolute',
    right: 132,
    width: 170,
  },
  checkinPanel: {
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: -74,
    padding: 28,
    zIndex: 3,
    ...GardenShadow,
  },
  checkinForm: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'center',
  },
  choiceCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,253,249,0.78)',
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 112,
    minWidth: 210,
  },
  choiceYes: {
    backgroundColor: '#C7E7D1',
    borderColor: 'rgba(82,144,104,0.26)',
  },
  choiceIcon: {
    borderColor: GardenColors.ink,
    borderRadius: 13,
    borderWidth: 1.6,
    height: 26,
    position: 'relative',
    width: 26,
  },
  choiceTick: {
    borderColor: GardenColors.ink,
    borderRightWidth: 2,
    borderTopWidth: 2,
    height: 12,
    left: 7,
    position: 'absolute',
    top: 5,
    transform: [{ rotate: '45deg' }],
    width: 8,
  },
  choiceSlash: {
    backgroundColor: GardenColors.ink,
    height: 1.6,
    left: 5,
    position: 'absolute',
    right: 5,
    top: 11,
    transform: [{ rotate: '44deg' }],
  },
  choiceText: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 18,
  },
  statusBlock: {
    alignItems: 'center',
    gap: 12,
  },
  status: {
    color: GardenColors.mintDeep,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 21,
    textAlign: 'center',
  },
  statusMuted: {
    color: GardenColors.inkSoft,
  },
  linkButton: {
    color: GardenColors.inkSoft,
    textDecorationLine: 'underline',
  },
  summaryStrip: {
    alignItems: 'center',
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 18,
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    ...GardenShadow,
  },
  summaryRing: {
    borderColor: GardenColors.mint,
    borderRadius: 27,
    borderWidth: 8,
    height: 54,
    width: 54,
  },
  summaryNumber: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 30,
    lineHeight: 32,
  },
  summaryLabel: {
    color: GardenColors.inkSoft,
  },
  summaryCopy: {
    color: GardenColors.inkSoft,
    flex: 1,
    lineHeight: 22,
  },
  notificationSettings: {
    alignItems: 'center',
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...GardenShadow,
  },
  testButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,253,249,0.82)',
    borderColor: GardenColors.line,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 18,
    minHeight: 44,
    paddingHorizontal: 18,
  },
  testButtonText: {
    color: GardenColors.mintDeep,
  },
  notificationText: {
    color: GardenColors.ink,
  },
  errorBox: {
    backgroundColor: '#FFF6E0',
    borderColor: 'rgba(198,139,43,0.34)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
  },
  errorText: {
    color: '#B42318',
  },
  listSection: {
    backgroundColor: GardenColors.glass,
    borderColor: GardenColors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 22,
    ...GardenShadow,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: GardenColors.ink,
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: 22,
  },
  sectionLink: {
    color: GardenColors.mintDeep,
  },
  taskItem: {
    borderTopColor: GardenColors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    paddingVertical: 15,
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
  taskState: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,253,249,0.7)',
    borderRadius: 999,
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  done: {
    backgroundColor: GardenColors.mintDeep,
  },
  skipped: {
    backgroundColor: 'rgba(246,201,181,0.72)',
  },
  taskStateText: {
    color: GardenColors.inkSoft,
  },
  doneText: {
    color: '#FFFFFF',
  },
  emptyNote: {
    color: GardenColors.inkSoft,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ translateY: -1 }],
  },
});
